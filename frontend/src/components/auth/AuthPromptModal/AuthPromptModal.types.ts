export interface AuthPromptModalProps {
  isOpen: boolean;
  mode: 'signin' | 'signup';
  onClose: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onGoogleSignIn: () => void;
  isLoading?: boolean;
  activeAction?: 'signin' | 'signup' | 'google' | null;
  error?: string | null;
}
