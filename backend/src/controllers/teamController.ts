import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types';
import { TeamInvitation } from '../models/TeamInvitation';
import { User } from '../models/User';
import {
  buildAppUser,
  createWorkspaceForUser,
  getWorkspaceMembers,
  isWorkspaceAdmin,
  normalizeWorkspaceEmail,
} from '../services/workspaceService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requireWorkspaceAdmin = (
  req: AuthenticatedRequest,
  res: Response
): boolean => {
  if (!isWorkspaceAdmin(req.user!)) {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Only workspace admins can manage team members.',
      },
    });
    return false;
  }

  if (!req.user!.organizationId) {
    res.status(400).json({
      success: false,
      error: {
        code: 'NO_WORKSPACE',
        message: 'No workspace is attached to this user.',
      },
    });
    return false;
  }

  return true;
};

export const getTeamWorkspace = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appUser = await buildAppUser(req.user!);
    const members = await getWorkspaceMembers(req.user!);
    const invitations = req.user!.organizationId
      ? await TeamInvitation.find({
          organizationId: req.user!.organizationId,
          status: 'pending',
          expiresAt: { $gt: new Date() },
        })
          .populate('invitedBy', 'name email')
          .sort({ createdAt: -1 })
      : [];

    res.json({
      success: true,
      data: {
        organization: appUser?.organization ?? null,
        members: members.map((member) => ({
          _id: member._id.toString(),
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          role: member.organizationRole || 'member',
          joinedAt: member.createdAt,
          isCurrentUser: member._id.toString() === req.user!._id.toString(),
        })),
        invitations: invitations.map((invitation) => ({
          _id: invitation._id.toString(),
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt,
          invitedBy:
            invitation.invitedBy &&
            typeof invitation.invitedBy === 'object' &&
            'name' in invitation.invitedBy
              ? {
                  _id: invitation.invitedBy._id.toString(),
                  name: (invitation.invitedBy as { name: string }).name,
                  email: (invitation.invitedBy as { email?: string }).email,
                }
              : undefined,
        })),
        permissions: {
          canManageTeam: isWorkspaceAdmin(req.user!),
          canManageWhiteLabel: isWorkspaceAdmin(req.user!),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const inviteTeamMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!requireWorkspaceAdmin(req, res)) return;

    const { email, role } = req.body as {
      email?: string;
      role?: 'admin' | 'member';
    };
    const normalizedEmail = email ? normalizeWorkspaceEmail(email) : '';

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'A valid email address is required.',
        },
      });
      return;
    }

    if (!role || !['admin', 'member'].includes(role)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Role must be admin or member.',
        },
      });
      return;
    }

    const existingMember = await User.findOne({
      email: normalizedEmail,
      organizationId: req.user!.organizationId,
    }).select('_id');

    if (existingMember) {
      res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_MEMBER',
          message: 'That user is already a member of this workspace.',
        },
      });
      return;
    }

    const existingInvitation = await TeamInvitation.findOne({
      email: normalizedEmail,
      organizationId: req.user!.organizationId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (existingInvitation) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVITE_EXISTS',
          message:
            'A pending invitation already exists for that email address.',
        },
      });
      return;
    }

    const invitation = await TeamInvitation.create({
      organizationId: req.user!.organizationId,
      email: normalizedEmail,
      role,
      invitedBy: new mongoose.Types.ObjectId(req.user!._id.toString()),
    });

    res.status(201).json({
      success: true,
      data: {
        _id: invitation._id.toString(),
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeamMemberRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!requireWorkspaceAdmin(req, res)) return;

    const { role } = req.body as { role?: 'admin' | 'member' };
    if (!role || !['admin', 'member'].includes(role)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Role must be admin or member.',
        },
      });
      return;
    }

    const member = await User.findOne({
      _id: req.params.userId,
      organizationId: req.user!.organizationId,
    });

    if (!member) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workspace member not found.' },
      });
      return;
    }

    if (member.organizationRole === 'owner') {
      res.status(400).json({
        success: false,
        error: {
          code: 'OWNER_IMMUTABLE',
          message: 'The workspace owner role cannot be changed.',
        },
      });
      return;
    }

    member.organizationRole = role;
    await member.save();

    res.json({
      success: true,
      data: {
        _id: member._id.toString(),
        role: member.organizationRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeTeamMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!requireWorkspaceAdmin(req, res)) return;

    const member = await User.findOne({
      _id: req.params.userId,
      organizationId: req.user!.organizationId,
    });

    if (!member) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workspace member not found.' },
      });
      return;
    }

    if (member.organizationRole === 'owner') {
      res.status(400).json({
        success: false,
        error: {
          code: 'OWNER_IMMUTABLE',
          message: 'The workspace owner cannot be removed.',
        },
      });
      return;
    }

    member.organizationId = undefined;
    member.organizationRole = undefined;
    await member.save();
    await createWorkspaceForUser(member);

    res.json({
      success: true,
      data: { message: 'Member removed from workspace.' },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelTeamInvitation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!requireWorkspaceAdmin(req, res)) return;

    const invitation = await TeamInvitation.findOneAndUpdate(
      {
        _id: req.params.invitationId,
        organizationId: req.user!.organizationId,
        status: 'pending',
      },
      { status: 'revoked' },
      { new: true }
    );

    if (!invitation) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invitation not found.' },
      });
      return;
    }

    res.json({ success: true, data: { message: 'Invitation cancelled.' } });
  } catch (error) {
    next(error);
  }
};
