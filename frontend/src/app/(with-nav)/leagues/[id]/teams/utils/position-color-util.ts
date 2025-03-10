export function getPositionCountColor(positions: string[], count: number): string {
  // Forward positions
  if (positions.includes('LW') || positions.includes('C') || positions.includes('RW')) {
    if (count === 3) return 'text-green-500';
    else if (count === 2) return 'text-yellow-500';
    else return 'text-red-500';
  }

  // Defense positions
  else if (positions.includes('LD') || positions.includes('RD')) {
    if (count === 3) return 'text-green-500';
    else if (count === 2) return 'text-yellow-500';
    else return 'text-red-500';
  }

  // Goalies
  else if (positions.includes('G')) {
    if (count >= 2) return 'text-green-500';
    else if (count === 1) return 'text-yellow-500';
    else return 'text-red-500';
  }

  // Position groups
  else if (positions.includes('LW') && positions.includes('C') && positions.includes('RW')) {
    if (count === 9) return 'text-green-500';
    else if (count >= 6 && count < 9) return 'text-yellow-500';
    else return 'text-red-500';
  } else if (positions.includes('LD') && positions.includes('RD')) {
    if (count >= 6) return 'text-green-500';
    else if (count >= 4 && count < 6) return 'text-yellow-500';
    else return 'text-red-500';
  }

  return 'text-white'; // Default
}
