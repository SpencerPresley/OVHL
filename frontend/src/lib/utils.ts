import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 *
 * @function
 * @param {...ClassValue} inputs - Class names or conditional class objects
 * @returns {string} Merged and deduplicated class string
 *
 * @example
 * ```ts
 * cn("px-4 py-2", "bg-blue-500", { "text-white": true })
 * // => "px-4 py-2 bg-blue-500 text-white"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPositionColors(position: string) {
  switch (position) {
    case 'C':
      return { text: 'text-red-400', border: 'border-red-400/30', bg: 'bg-red-400/20' };
    case 'LW':
      return { text: 'text-green-400', border: 'border-green-400/30', bg: 'bg-green-400/20' };
    case 'RW':
      return { text: 'text-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-400/20' };
    case 'LD':
      return { text: 'text-teal-400', border: 'border-teal-400/30', bg: 'bg-teal-400/20' };
    case 'RD':
      return { text: 'text-yellow-400', border: 'border-yellow-400/30', bg: 'bg-yellow-400/20' };
    case 'G':
      return { text: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-400/20' };
    default:
      return { text: 'text-gray-400', border: 'border-gray-400/30', bg: 'bg-gray-400/20' };
  }
}
