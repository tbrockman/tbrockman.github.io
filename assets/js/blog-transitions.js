/**
 * Blog List Transition Enhancement
 *
 * Sets view-transition-names on click for reliable cross-document view transitions.
 * The clicked card gets 'active-blog-card' and other items get 'blog-away-N' names.
 *
 * CSS handles both forward and backward animations automatically - the old/new
 * pseudo-elements naturally apply to whichever direction the navigation goes.
 *
 * For browsers without full View Transition API support (e.g., Firefox with
 * reduced motion), cleanup is handled via pageshow to ensure styles don't persist
 * when pages are restored from bfcache.
 */

(function() {
  'use strict';

  // Session storage key to remember which post was clicked
  const STORAGE_KEY_URL = 'vt-clicked-post-url';
  const STORAGE_KEY_INDEX = 'vt-clicked-post-index';

  // Current page state
  let clickedLink = null;
  let clickedIndex = -1;
  
  // Track whether we're in an active view transition
  let activeViewTransition = false;

  /**
   * Set up view-transition-names on blog elements.
   * @param {HTMLElement|null} targetLink - The link to mark as active (from click or storage)
   * @param {number} targetIndex - The index of the target link
   */
  function setupTransitionNames(targetLink, targetIndex) {
    const blogLinks = document.querySelectorAll('.blog-list > a');
    if (blogLinks.length === 0) return;
    
    if (!targetLink && targetIndex >= 0 && targetIndex < blogLinks.length) {
      targetLink = blogLinks[targetIndex];
    }
    
    if (!targetLink) return;
    
    // The target card gets the "active-blog-card" name
    // Note: We intentionally DON'T set post-title on the card's title element
    // because doing so extracts the title from the card's snapshot, leaving a "hole".
    // Instead, let the whole card (including title) animate as one unit.
    // CSS attribute selector [style*="view-transition-name"] will hide box-shadows
    // from both the card and .blog-post-preview when this is set.
    targetLink.style.viewTransitionName = 'active-blog-card';
    
    // Each non-target blog item gets a unique name for individual slide animations
    let awayIndex = 0;
    blogLinks.forEach((link, index) => {
      if (link !== targetLink) {
        link.style.viewTransitionName = `blog-away-${awayIndex}`;
        awayIndex++;
      }
    });
  }

  /**
   * Find blog link by URL or index from storage
   */
  function findStoredBlogLink() {
    const blogLinks = document.querySelectorAll('.blog-list > a');
    if (blogLinks.length === 0) return { link: null, index: -1 };
    
    const storedUrl = sessionStorage.getItem(STORAGE_KEY_URL);
    const storedIndex = parseInt(sessionStorage.getItem(STORAGE_KEY_INDEX) || '-1', 10);
    
    if (!storedUrl) return { link: null, index: -1 };
    
    // Try to find by URL first (more reliable)
    for (let i = 0; i < blogLinks.length; i++) {
      const linkPath = new URL(blogLinks[i].href, window.location.origin).pathname;
      const storedPath = new URL(storedUrl, window.location.origin).pathname;
      
      if (linkPath === storedPath) {
        return { link: blogLinks[i], index: i };
      }
    }
    
    // Fall back to index
    if (storedIndex >= 0 && storedIndex < blogLinks.length) {
      return { link: blogLinks[storedIndex], index: storedIndex };
    }
    
    return { link: null, index: -1 };
  }

  /**
   * Clean up view-transition-names from all blog items
   */
  function cleanupTransitionNames() {
    const blogLinks = document.querySelectorAll('.blog-list > a');
    blogLinks.forEach((link) => {
      link.style.viewTransitionName = '';
    });
  }

  // Set up click handlers when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const blogLinks = document.querySelectorAll('.blog-list > a');
    
    if (blogLinks.length === 0) return;

    blogLinks.forEach((link, index) => {
      link.addEventListener('click', () => {
        // Remember which link was clicked
        clickedLink = link;
        clickedIndex = index;
        
        // Store for cross-document navigation (for backward nav to work)
        sessionStorage.setItem(STORAGE_KEY_URL, link.href);
        sessionStorage.setItem(STORAGE_KEY_INDEX, index.toString());
        
        // Set view-transition-names immediately on click
        // This ensures they're set before the snapshot is taken
        setupTransitionNames(link, index);
      });
    });
  });

  // pageswap fires right before the view transition snapshot is taken on the OLD page
  window.addEventListener('pageswap', (e) => {
    if (!e.viewTransition) return;
    
    // If we have a clicked link from this page, ensure names are set
    if (clickedLink) {
      setupTransitionNames(clickedLink, clickedIndex);
    }
  });

  // pagereveal fires when this page is revealed after a cross-document navigation
  window.addEventListener('pagereveal', (e) => {
    const isBlogListPage = document.querySelector('.blog-list') !== null;
    
    // If view transitions aren't supported (e.g., Firefox with reduced motion),
    // clean up immediately and clear storage to prevent stale styles
    if (!e.viewTransition) {
      if (isBlogListPage) {
        cleanupTransitionNames();
        sessionStorage.removeItem(STORAGE_KEY_URL);
        sessionStorage.removeItem(STORAGE_KEY_INDEX);
      }
      return;
    }
    
    // Mark that we have an active view transition
    activeViewTransition = true;
    
    if (isBlogListPage) {
      // We're on the blog list - this could be:
      // 1. Backward navigation from a post
      // 2. Fresh navigation to blog list
      
      // Try to find the previously clicked link for backward animation
      const { link, index } = findStoredBlogLink();
      
      if (link) {
        // Set up transition names for backward navigation
        setupTransitionNames(link, index);
      }
      
      // Clean up after transition completes
      e.viewTransition.finished.then(() => {
        activeViewTransition = false;
        cleanupTransitionNames();
        // Clear stored state
        sessionStorage.removeItem(STORAGE_KEY_URL);
        sessionStorage.removeItem(STORAGE_KEY_INDEX);
      }).catch(() => {
        // Transition was skipped or failed, still clean up
        activeViewTransition = false;
        cleanupTransitionNames();
        sessionStorage.removeItem(STORAGE_KEY_URL);
        sessionStorage.removeItem(STORAGE_KEY_INDEX);
      });
    } else {
      // Not on blog list, clear the active flag when transition finishes
      e.viewTransition.finished.then(() => {
        activeViewTransition = false;
      }).catch(() => {
        activeViewTransition = false;
      });
    }
    
    // Reset local state
    clickedLink = null;
    clickedIndex = -1;
  });

  // pageshow fires when the page is shown, including when restored from bfcache.
  // When restored from bfcache, pagereveal does NOT fire, so we handle cleanup here.
  // Note: View transitions don't work with bfcache restoration - the page appears instantly.
  window.addEventListener('pageshow', (e) => {
    const isBlogListPage = document.querySelector('.blog-list') !== null;
    
    if (e.persisted) {
      // Page was restored from bfcache (no view transition occurred)
      // Clean up any lingering view-transition-name styles from previous navigation
      if (isBlogListPage) {
        cleanupTransitionNames();
      }
      // Reset state since bfcache restoration doesn't trigger view transitions
      activeViewTransition = false;
      // Keep sessionStorage intact for future back/forward navigation
      // (only clear it after a successful view transition in pagereveal)
    }
  });
  
  // Handle initial page load (not from bfcache)
  // Clean up any stale transition names that might exist from a previous session
  if (document.querySelector('.blog-list')) {
    cleanupTransitionNames();
  }
})();
