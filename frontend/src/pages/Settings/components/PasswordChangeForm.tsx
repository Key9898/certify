import { useState } from 'react';
import {
  Eye,
  EyeOff,
  KeyRound,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button';

interface PasswordChangeFormProps {
  onChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onChangePassword,
  isLoading,
  error,
  success,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!currentPassword.trim()) {
      setValidationError('Current password is required');
      return false;
    }
    if (!newPassword.trim()) {
      setValidationError('New password is required');
      return false;
    }
    if (newPassword.length < 8) {
      setValidationError('New password must be at least 8 characters');
      return false;
    }
    if (newPassword === currentPassword) {
      setValidationError(
        'New password must be different from current password'
      );
      return false;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onChangePassword(currentPassword, newPassword);
  };

  const handleInputChange =
    (setter: (val: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setValidationError(null);
    };

  const passwordRequirements = [
    { met: newPassword.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
    { met: /[a-z]/.test(newPassword), text: 'One lowercase letter' },
    { met: /[0-9]/.test(newPassword), text: 'One number' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="label">
            <span className="label-text font-semibold text-sm">
              Current Password
            </span>
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              className="input input-bordered w-full h-12 pr-12 rounded-lg"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={handleInputChange(setCurrentPassword)}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/60 transition-colors"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              tabIndex={-1}
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="label">
            <span className="label-text font-semibold text-sm">
              New Password
            </span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              className="input input-bordered w-full h-12 pr-12 rounded-lg"
              placeholder="Enter new password"
              value={newPassword}
              onChange={handleInputChange(setNewPassword)}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/60 transition-colors"
              onClick={() => setShowNewPassword(!showNewPassword)}
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {newPassword && (
            <div className="flex flex-wrap gap-2 mt-2">
              {passwordRequirements.map((req, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full transition-all ${
                    req.met
                      ? 'bg-success/10 text-success'
                      : 'bg-base-200 text-base-content/40'
                  }`}
                >
                  {req.met ? <Check size={10} /> : <AlertCircle size={10} />}
                  {req.text}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="label">
            <span className="label-text font-semibold text-sm">
              Confirm New Password
            </span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="input input-bordered w-full h-12 pr-12 rounded-lg"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/60 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && newPassword && (
            <AnimatePresence>
              {newPassword === confirmPassword ? (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-success/10 text-success"
                >
                  <Check size={10} /> Passwords match
                </motion.span>
              ) : (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-error/10 text-error"
                >
                  <AlertCircle size={10} /> Passwords do not match
                </motion.span>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(validationError || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="alert border-error/30 bg-error/10 py-3 rounded-lg gap-3"
          >
            <AlertCircle size={16} className="text-error shrink-0" />
            <span className="text-xs font-semibold text-error">
              {validationError || error}
            </span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="alert border-success/30 bg-success/10 py-3 rounded-lg gap-3"
          >
            <Check size={16} className="text-success shrink-0" />
            <span className="text-xs font-semibold text-success">
              Password changed successfully!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          isLoading={isLoading}
          className="h-11 px-8 font-bold uppercase tracking-wider text-xs rounded-lg"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <KeyRound size={14} className="mr-2" />
              Update Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
