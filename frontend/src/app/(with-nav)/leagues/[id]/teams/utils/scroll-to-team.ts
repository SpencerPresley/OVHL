'use client';

/**
 * Scrolls to a specific team's card and applies a temporary flash effect.
 * @param {string} teamId - ID of the team to scroll to
 */
export function scrollToTeam(teamId: string): void {
  const element = document.getElementById(teamId);
  if (element) {
    const isMobile = window.innerWidth < 768;
    const headerOffset = isMobile ? 29 : 200; // Adjusted offset slightly, check if needed
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const animationDuration = 1500; // MUST match the CSS shimmer animation duration (1.5s = 1500ms)
    const startAnimationDelay = 400; // Delay before starting flash (in ms)

    window.scrollTo({
      top: elementPosition - headerOffset,
      behavior: 'smooth',
    });

    // Wait a short moment after initiating scroll before starting animation
    setTimeout(() => {
      // Check if element still exists in case of fast navigation/unmount
      if (document.getElementById(teamId)) {
        // Apply the flash effect class
        element.classList.add('flash-effect');

        // Remove the class after the animation finishes
        setTimeout(() => {
          // Check again before removing class
          if (document.getElementById(teamId)) {
             element.classList.remove('flash-effect');
          }
        }, animationDuration);
      }
    }, startAnimationDelay);
  }
}
