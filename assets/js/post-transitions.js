/**
 * Post Page Transition Enhancement
 *
 * View transition names are set statically in CSS (_view-transitions.scss)
 * for reliable cross-document transitions. This script handles:
 * - Adding the vt-reveal class for staggered content animations on post pages
 */

(function() {
  'use strict';

  // pagereveal fires when the new page is revealed after a cross-document view transition
  window.addEventListener('pagereveal', (e) => {
    if (!e.viewTransition) return;
    
    // Check if we're on a post page (has post-container)
    const isPostPage = document.querySelector('.post-container') !== null;
    
    if (isPostPage) {
      // Add class to trigger staggered content reveal after transition starts
      e.viewTransition.ready.then(() => {
        document.body.classList.add('vt-reveal');
      }).catch(() => {
        // Transition was skipped, still add class for consistency
        document.body.classList.add('vt-reveal');
      });
    }
  });
})();
