/**
 * Utility functions for formatting PSN profile data
 */

// Format playtime from minutes to hours and days
export function formatPlaytime(minutes: number | null): string {
  if (!minutes) return 'N/A';

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;

  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  result += `${mins}m`;

  return result;
}

// Format date to a readable string
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Get platform label from platform code
export function getPlatformLabel(platform: string): string {
  switch (platform) {
    case 'ps5_native_game':
      return 'PS5';
    case 'ps4_game':
      return 'PS4';
    default:
      return platform.toUpperCase().replace('_', ' ');
  }
}

// Find the largest avatar from the avatars array
export function getLargeAvatar(
  avatars: { size: string; url: string }[]
): { size: string; url: string } | undefined {
  return (
    avatars?.find((a) => a.size === 'xl') || avatars?.find((a) => a.size === 'l') || avatars?.[0]
  );
}
