/**
 * Returns the background color class for a player position
 * @param position Player position code
 * @returns Tailwind background color class
 */
export function getPositionColor(position: string): string {
  switch (position) {
    case 'C':
      return 'bg-red-500';
    case 'LW':
      return 'bg-green-500';
    case 'RW':
      return 'bg-blue-500';
    case 'LD':
      return 'bg-teal-500';
    case 'RD':
      return 'bg-yellow-500';
    case 'G':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}
