import React from 'react';
import { ArrowRight, Globe, LogIn, UserPlus } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import type { AuthPromptModalProps } from './AuthPromptModal.types';

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  isLoading = false,
  activeAction = null,
  error = null,
}) => {
  const isSignupMode = mode === 'signup';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSignupMode ? 'Create your Certify account' : 'Sign in to Certify'}
      size="md"
    >
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-base-content/60">
          {isSignupMode
            ? 'Choose how you want to start. Certify will open a secure Auth0 sign-up popup so you can enter your email and password, or continue with Google.'
            : 'Choose how you want to continue. Certify will open a secure Auth0 sign-in popup so you can enter your account details, then take you straight to your dashboard.'}
        </p>

        <div className="space-y-3">
          <button
            type="button"
            className="btn btn-primary h-12 w-full justify-between rounded"
            onClick={onSignIn}
            disabled={isLoading}
          >
            <span className="flex items-center gap-3">
              <LogIn size={18} />
              Sign in
            </span>
            {activeAction === 'signin' && isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <ArrowRight size={16} />
            )}
          </button>

          <button
            type="button"
            className="btn btn-outline h-12 w-full justify-between rounded"
            onClick={onSignUp}
            disabled={isLoading}
          >
            <span className="flex items-center gap-3">
              <UserPlus size={18} />
              Sign up
            </span>
            {activeAction === 'signup' && isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <ArrowRight size={16} />
            )}
          </button>

          <button
            type="button"
            className="btn btn-ghost h-12 w-full justify-between rounded border border-base-200 bg-base-100"
            onClick={onGoogleSignIn}
            disabled={isLoading}
          >
            <span className="flex items-center gap-3">
              <Globe size={18} />
              Sign in with Google
            </span>
            {activeAction === 'google' && isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <ArrowRight size={16} />
            )}
          </button>
        </div>

        {error ? (
          <div className="alert alert-error rounded border-none text-sm">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="rounded border border-base-200 bg-base-200/50 px-4 py-3 text-xs leading-relaxed text-base-content/55">
          Your email/password form is hosted by Auth0 for security. If the popup is blocked or
          your localhost origin is not allowed in Auth0 yet, Certify will try the full-page login
          flow instead.
        </div>
      </div>
    </Modal>
  );
};
