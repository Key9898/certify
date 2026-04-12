export interface HeaderProps {
  onMenuToggle?: () => void;
  onOpenAuthModal?: (mode: 'signin' | 'signup') => void;
  onOpenVerifyModal?: () => void;
}
