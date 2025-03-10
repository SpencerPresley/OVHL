'use client';

/**
 * Scrolls to a specific team's card
 * @param {string} teamId - ID of the team to scroll to
 */
export function scrollToTeam(teamId: string): void {
  const element = document.getElementById(teamId);
  if (element) {
    const isMobile = window.innerWidth < 768;
    const headerOffset = isMobile ? 220 : 120;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: elementPosition - headerOffset,
      behavior: 'smooth',
    });
  }
}
