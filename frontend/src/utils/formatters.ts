export const formatDate = (
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
};

export const formatDateShort = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

interface AuthProfileLike {
  name?: string | null;
  nickname?: string | null;
  given_name?: string | null;
  email?: string | null;
}

const normalizeDisplayName = (value?: string | null): string => {
  return value?.trim() || '';
};

export const getAuthProfileDisplayName = (
  profile?: AuthProfileLike | null
): string => {
  const explicitName =
    normalizeDisplayName(profile?.name) ||
    normalizeDisplayName(profile?.nickname) ||
    normalizeDisplayName(profile?.given_name);

  if (explicitName) {
    return explicitName;
  }

  const emailLocalPart = profile?.email?.split('@')[0]?.trim();
  if (emailLocalPart) {
    return emailLocalPart.replace(/[._-]+/g, ' ');
  }

  return 'Member';
};

export const getAuthProfileInitial = (
  profile?: AuthProfileLike | null
): string => {
  return getAuthProfileDisplayName(profile).charAt(0).toUpperCase() || 'M';
};
