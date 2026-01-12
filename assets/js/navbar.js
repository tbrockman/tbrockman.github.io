// Vibe-coded with very little verification, do not trust or assume anything in here is correct or efficient or intelligent.

class MobileNavbar {
    constructor() {
        this.container = document.getElementById("navbar-fab-container");
        this.fab = document.getElementById("navbar-fab");
        this.navItems = document.getElementById("navbar-items");

        if (!this.container || !this.fab) return;

        // Dimensions (must match SCSS variables)
        this.fabSize = 48;
        this.fabPadding = 16; // Edge padding for snap points
        this.containerPadding = 4; // Internal padding of the container
        this.containerBorder = 3; // Border width
        this.navItemSize = 44;
        this.navItemGap = 4;
        // Count only actual nav items (exclude spacer)
        this.navItemCount = this.navItems ?
            this.navItems.querySelectorAll('.nav-item').length : 6;

        // State
        this.isExpanded = false;
        this.isDragging = false;
        this.dragStartTime = 0;
        this.holdThreshold = 2500; // 2.5 seconds for free positioning
        this.longPressThreshold = 500; // 500ms for collapse
        this.snapEnabled = true;
        this.currentPosition = { x: 0, y: 0 };
        this.currentExpandDirection = 'left'; // 'left' or 'right'
        this.currentSnapPoint = null;
        
        // localStorage key for persisting position
        this.storageKey = 'navbar-fab-position';

        // Snap points (calculated on resize)
        this.snapPoints = [];
        this.calculateSnapPoints();

        // Set initial position (from localStorage or default to bottom-right)
        this.setInitialPosition();
        
        // Show container after position is set (prevents visual jump)
        this.container.classList.add('initialized');

        // Initialize interact.js when loaded
        if (window.interactLoaded) {
            this.setupInteract();
        } else {
            window.addEventListener('interactLoaded', () => this.setupInteract());
        }

        // Event listeners
        this.fab.addEventListener('click', (e) => this.onFabClick(e));
        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('click', (e) => this.onDocumentClick(e));

        // Long press detection for collapse
        this.setupLongPressDetection();
    }

    calculateSnapPoints() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const padX = this.fabPadding;
        // Top padding is smaller since no box shadow extends above
        const padYTop = this.fabPadding;
        // Bottom padding is larger to account for box shadow below (-4px 4px shadow)
        const padYBottom = this.fabPadding + 8;
        const cp = this.containerPadding; // container's internal padding
        
        // Container total size when collapsed = fabSize + 2*containerPadding
        const containerSize = this.fabSize + (cp * 2);

        // 6 snap points: 4 corners + 2 vertical center (left/right edges)
        // All use horizontal expansion
        // Position is for container's top-left, so FAB is at position + containerPadding
        this.snapPoints = [
            // Top corners - smaller top padding (no shadow above)
            {
                x: padX,
                y: padYTop,
                position: 'top-left',
                expandDirection: 'right'
            },
            {
                x: vw - containerSize - padX,
                y: padYTop,
                position: 'top-right',
                expandDirection: 'left'
            },
            // Bottom corners - larger bottom padding (shadow extends below)
            {
                x: padX,
                y: vh - containerSize - padYBottom,
                position: 'bottom-left',
                expandDirection: 'right'
            },
            {
                x: vw - containerSize - padX,
                y: vh - containerSize - padYBottom,
                position: 'bottom-right',
                expandDirection: 'left'
            },
            // Vertical center points (left/right edges)
            {
                x: padX,
                y: (vh - containerSize) / 2,
                position: 'left-center',
                expandDirection: 'right'
            },
            {
                x: vw - containerSize - padX,
                y: (vh - containerSize) / 2,
                position: 'right-center',
                expandDirection: 'left'
            }
        ];
    }

    getNavbarContentLength() {
        // Calculate total length of nav items content (excluding spacer)
        // Each item: navItemSize + navItemGap
        return (this.navItemSize + this.navItemGap) * this.navItemCount;
    }

    getExpandedContainerWidth() {
        // Calculate the width the container should expand to
        // This is the distance from one snap point edge to the opposing snap point edge
        const vw = window.innerWidth;
        // Available width = viewport - both edge paddings - border on both sides
        const maxWidth = vw - (this.fabPadding * 2) - (this.containerBorder * 2);
        
        // Content width needed: FAB + spacer overlap + items + some padding
        // The spacer overlaps with FAB, so we only need: FAB + items content
        const contentWidth = this.fabSize + this.getNavbarContentLength() + this.containerPadding;
        
        // Return the minimum of max available and content needed
        return Math.min(maxWidth, contentWidth);
    }

    hasOverflow() {
        // Check if content would overflow the available space
        const vw = window.innerWidth;
        const maxAvailableWidth = vw - (this.fabPadding * 2) - (this.containerBorder * 2) - (this.containerPadding * 2);
        const contentWidth = this.fabSize + this.getNavbarContentLength();
        return contentWidth > maxAvailableWidth;
    }

    getMaxVisibleItemsWidth() {
        // Always show at most 3.5 items at a time (creates visual cue that there are more items)
        // 3.5 items = 3.5 * (navItemSize + navItemGap)
        const visibleItemsWidth = 3.5 * (this.navItemSize + this.navItemGap);
        // Plus the spacer (which is under the FAB)
        return this.fabSize + visibleItemsWidth;
    }

    updateExpandedWidth() {
        // Always set a specific width value for smooth CSS transitions
        // (CSS cannot animate between 0 and 'auto')
        // Use fixed width showing 3.5 items to indicate scrollability
        const itemsWidth = this.getMaxVisibleItemsWidth();
        this.navItems.style.setProperty('--navbar-items-width', `${itemsWidth}px`);
    }

    setInitialPosition() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const containerSize = this.fabSize + (this.containerPadding * 2);
        
        // Try to load position from localStorage
        const savedPosition = this.loadPositionFromStorage();
        
        if (savedPosition && this.isValidPosition(savedPosition)) {
            // Use saved position
            this.currentSnapPoint = this.snapPoints.find(p => p.position === savedPosition.snapPointPosition);
            if (this.currentSnapPoint) {
                this.currentPosition = { x: this.currentSnapPoint.x, y: this.currentSnapPoint.y };
                this.currentExpandDirection = this.currentSnapPoint.expandDirection;
            } else {
                // Fallback to default if snap point not found
                this.setDefaultPosition(vw, vh, containerSize);
            }
        } else {
            // Default to bottom-right
            this.setDefaultPosition(vw, vh, containerSize);
        }

        this.container.classList.add(`expand-${this.currentExpandDirection}`);
        this.updateContainerPosition();
        
        // Set initial expanded width CSS variable
        this.updateExpandedWidth();
    }
    
    setDefaultPosition(vw, vh, containerSize) {
        const padYBottom = this.fabPadding + 8;
        this.currentPosition = {
            x: vw - containerSize - this.fabPadding,
            y: vh - containerSize - padYBottom
        };
        this.currentSnapPoint = this.snapPoints.find(p => p.position === 'bottom-right');
        this.currentExpandDirection = this.currentSnapPoint ? this.currentSnapPoint.expandDirection : 'left';
    }
    
    loadPositionFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load navbar position from localStorage', e);
        }
        return null;
    }
    
    savePositionToStorage() {
        try {
            if (this.currentSnapPoint) {
                localStorage.setItem(this.storageKey, JSON.stringify({
                    snapPointPosition: this.currentSnapPoint.position,
                    expandDirection: this.currentExpandDirection
                }));
            }
        } catch (e) {
            console.warn('Failed to save navbar position to localStorage', e);
        }
    }
    
    isValidPosition(savedPosition) {
        // Check if the saved snap point still exists
        return this.snapPoints.some(p => p.position === savedPosition.snapPointPosition);
    }

    updateContainerPosition() {
        const vw = window.innerWidth;
        const containerSize = this.fabSize + (this.containerPadding * 2);
        
        // When expanding left (from right side), anchor by right edge
        // When expanding right (from left side), anchor by left edge
        if (this.currentExpandDirection === 'left') {
            // Position by right edge
            this.container.style.left = 'auto';
            this.container.style.right = `${vw - this.currentPosition.x - containerSize}px`;
        } else {
            // Position by left edge
            this.container.style.right = 'auto';
            this.container.style.left = `${this.currentPosition.x}px`;
        }
        
        this.container.style.top = `${this.currentPosition.y}px`;
    }

    setupInteract() {
        if (typeof interact === 'undefined') {
            console.warn('interact.js not loaded');
            return;
        }

        const self = this;

        interact(this.container)
            .draggable({
                inertia: {
                    resistance: 12,
                    minSpeed: 200,
                    endSpeed: 80
                },
                modifiers: [
                    interact.modifiers.restrict({
                        restriction: 'parent',
                        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                    })
                ],
                listeners: {
                    start(event) {
                        self.onDragStart(event);
                    },
                    move(event) {
                        self.onDragMove(event);
                    },
                    end(event) {
                        self.onDragEnd(event);
                    }
                }
            });
    }

    onDragStart(event) {
        this.isDragging = true;
        this.dragStartTime = Date.now();
        this.snapEnabled = true;
        this.container.classList.add('dragging');

        // Start hold timer for free positioning
        this.holdTimer = setInterval(() => {
            if (Date.now() - this.dragStartTime >= this.holdThreshold) {
                this.snapEnabled = false;
                this.container.classList.add('free-position');
                clearInterval(this.holdTimer);
            }
        }, 100);
    }

    onDragMove(event) {
        const x = this.currentPosition.x + event.dx;
        const y = this.currentPosition.y + event.dy;
        
        this.currentPosition = { x, y };
        this.updateContainerPosition();

        // If expanded, check for overflow and flip direction if needed
        if (this.isExpanded) {
            this.checkAndFlipIfNeeded();
        }
    }

    onDragEnd(event) {
        clearInterval(this.holdTimer);
        this.container.classList.remove('dragging', 'free-position');

        const dragDuration = Date.now() - this.dragStartTime;
        
        // Small delay to prevent click from firing
        setTimeout(() => {
            this.isDragging = false;
        }, 50);

        // Only snap if enabled and wasn't held long enough
        if (this.snapEnabled && dragDuration < this.holdThreshold) {
            this.snapToNearestValidPoint();
        } else if (this.isExpanded) {
            // Check if we need to flip direction after free positioning
            this.checkAndFlipIfNeeded();
        }
    }

    snapToNearestValidPoint() {
        const nearest = this.findNearestSnapPoint(this.currentPosition);
        
        // Set the direction BEFORE animating to prevent visual shift
        // This ensures the animation uses the correct anchor point
        if (nearest.expandDirection !== this.currentExpandDirection) {
            this.setExpandDirectionWithoutPosition(nearest.expandDirection);
        }
        
        this.animateToPosition(nearest.x, nearest.y, () => {
            this.currentSnapPoint = nearest;
            // Save position to localStorage after snapping
            this.savePositionToStorage();
        });
    }

    findNearestSnapPoint(position) {
        let nearest = this.snapPoints[0];
        let minDistance = Infinity;

        for (const point of this.snapPoints) {
            const distance = Math.sqrt(
                Math.pow(position.x - point.x, 2) + 
                Math.pow(position.y - point.y, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearest = point;
            }
        }

        return nearest;
    }

    checkAndFlipIfNeeded() {
        if (!this.isExpanded) return;

        const vw = window.innerWidth;
        const expandedWidth = this.getExpandedContainerWidth();
        const collapsedSize = this.fabSize + (this.containerPadding * 2) + (this.containerBorder * 2);

        // Calculate overflow for both directions
        // For left expansion (FAB on right): container expands leftward from current right edge
        const leftOverflow = this.currentPosition.x + collapsedSize - expandedWidth - this.fabPadding;
        // For right expansion (FAB on left): container expands rightward from current left edge
        const rightOverflow = vw - this.currentPosition.x - expandedWidth - this.fabPadding;

        // Only flip if:
        // 1. Current direction overflows
        // 2. The other direction would NOT overflow (or would overflow less)
        // This prevents oscillation when both directions would overflow
        
        if (this.currentExpandDirection === 'left') {
            // Currently expanding left, check if it overflows left edge
            if (leftOverflow < 0 && rightOverflow > leftOverflow) {
                // Flip to right only if right has more space
                this.setExpandDirection('right');
                this.updateExpandedWidth();
            }
        } else if (this.currentExpandDirection === 'right') {
            // Currently expanding right, check if it overflows right edge
            if (rightOverflow < 0 && leftOverflow > rightOverflow) {
                // Flip to left only if left has more space
                this.setExpandDirection('left');
                this.updateExpandedWidth();
            }
        }
    }

    setExpandDirection(direction) {
        // Remove old direction classes
        this.container.classList.remove('expand-left', 'expand-right');
        
        this.currentExpandDirection = direction;
        this.container.classList.add(`expand-${direction}`);
        
        // Re-apply position with new anchor point
        this.updateContainerPosition();
    }

    setExpandDirectionWithoutPosition(direction) {
        // Change direction without updating position (used before animations)
        this.container.classList.remove('expand-left', 'expand-right');
        this.currentExpandDirection = direction;
        this.container.classList.add(`expand-${direction}`);
    }

    animateToPosition(x, y, callback) {
        const startX = this.currentPosition.x;
        const startY = this.currentPosition.y;
        const startTime = performance.now();
        const duration = 400;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.bouncyEase(progress);

            this.currentPosition = {
                x: startX + (x - startX) * eased,
                y: startY + (y - startY) * eased
            };
            this.updateContainerPosition();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.currentPosition = { x, y };
                if (callback) callback();
            }
        };

        requestAnimationFrame(animate);
    }

    bouncyEase(t) {
        // Custom bouncy easing (elastic out)
        const c4 = (2 * Math.PI) / 3;
        return t === 0
            ? 0
            : t === 1
            ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    onFabClick(e) {
        // Ignore if was just dragging
        if (this.isDragging) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (this.isExpanded) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    expand() {
        if (this.isExpanded) return;

        const vw = window.innerWidth;
        const expandedWidth = this.getExpandedContainerWidth();
        const collapsedSize = this.fabSize + (this.containerPadding * 2) + (this.containerBorder * 2);

        // Check available space and set optimal direction before expanding
        // For expand-left: available space is from left edge to container's right edge
        const spaceLeft = this.currentPosition.x + collapsedSize;
        // For expand-right: available space is from container's left edge to right edge
        const spaceRight = vw - this.currentPosition.x;

        if (this.currentExpandDirection === 'left' && spaceLeft < expandedWidth + this.fabPadding) {
            // Not enough space on left, try right
            if (spaceRight >= expandedWidth + this.fabPadding) {
                this.setExpandDirection('right');
            }
        } else if (this.currentExpandDirection === 'right' && spaceRight < expandedWidth + this.fabPadding) {
            // Not enough space on right, try left
            if (spaceLeft >= expandedWidth + this.fabPadding) {
                this.setExpandDirection('left');
            }
        }

        this.doExpand();
    }

    doExpand() {
        this.isExpanded = true;
        
        // Reset scroll position before expanding to prevent scroll position drift during animation
        this.navItems.scrollLeft = 0;
        
        // Ensure scrollable class is removed before transition starts
        this.navItems.classList.remove('scrollable');
        
        // Calculate and set the expanded width via CSS custom property FIRST
        this.updateExpandedWidth();
        
        // Use requestAnimationFrame to ensure the CSS variable is applied
        // before adding the expanded class, preventing any visual jump
        requestAnimationFrame(() => {
            // Double rAF ensures the browser has painted the initial state
            requestAnimationFrame(() => {
                // Add expanded class to trigger the transition
                this.container.classList.add('expanded');
                
                // Enable scrolling after the width transition completes
                // Always add scrollable class - overflow-x:auto will only scroll if needed
                // Match the transition duration in SCSS (0.35s = 350ms) + buffer
                setTimeout(() => {
                    if (this.isExpanded) {
                        this.navItems.classList.add('scrollable');
                    }
                }, 400);
            });
        });
    }

    collapse() {
        if (!this.isExpanded) return;

        // Remove scrollable class immediately to prevent scroll position issues during collapse
        this.navItems.classList.remove('scrollable');
        
        // Reset scroll position to prevent visual jump
        this.navItems.scrollLeft = 0;

        this.container.classList.add('collapsing');
        this.container.classList.remove('expanded');

        setTimeout(() => {
            this.isExpanded = false;
            this.container.classList.remove('collapsing');
        }, 250);
    }

    setupLongPressDetection() {
        let pressTimer;
        let isPressing = false;

        const startPress = (e) => {
            // Only trigger on navbar items area when expanded
            if (!this.isExpanded) return;
            if (this.fab.contains(e.target)) return; // FAB click handled separately
            
            isPressing = true;
            pressTimer = setTimeout(() => {
                if (isPressing && this.isExpanded) {
                    this.collapse();
                }
            }, this.longPressThreshold);
        };

        const endPress = () => {
            isPressing = false;
            clearTimeout(pressTimer);
        };

        if (this.navItems) {
            this.navItems.addEventListener('mousedown', startPress);
            this.navItems.addEventListener('touchstart', startPress, { passive: true });
            this.navItems.addEventListener('mouseup', endPress);
            this.navItems.addEventListener('mouseleave', endPress);
            this.navItems.addEventListener('touchend', endPress);
            this.navItems.addEventListener('touchcancel', endPress);
        }
    }

    onDocumentClick(e) {
        if (!this.isExpanded) return;

        // Click outside to collapse
        if (!this.container.contains(e.target)) {
            this.collapse();
        }
    }

    onResize() {
        this.calculateSnapPoints();

        // Update expanded width calculation (even if collapsed, for next expand)
        this.updateExpandedWidth();

        // Collapse on resize
        if (this.isExpanded) {
            this.collapse();
        }

        // Re-snap to valid position
        this.snapToNearestValidPoint();
    }
}

// Desktop navbar class (unchanged)
class DesktopNavbar {
    constructor() {
        this.navbar = document.getElementById("navbar");
        this.navbarHeader = document.getElementById("navbar-header");
        this.pageContainer = document.querySelector(".page-container");

        if (!this.navbar || !this.navbarHeader) return;

        this.lastScrollY = window.scrollY;
        this.lastInnerHeight = window.innerHeight;
        this.navbarVisible = true;
        this.isOpened = false;
        this.isScrolling = false;

        window.addEventListener("scroll", () => this.onScroll());
        document.addEventListener("click", (e) => this.onClick(e));
        window.addEventListener("resize", () => this.observeViewportResize());
    }

    observeViewportResize() {
        if (window.innerHeight > this.lastInnerHeight) {
            this.showNavbar();
        }
        this.lastInnerHeight = window.innerHeight;
    }

    onScroll() {
        if (this.isScrolling) return;

        this.isScrolling = true;
        requestAnimationFrame(() => {
            const currentY = window.scrollY;
            const velocityY = currentY - this.lastScrollY;

            if (velocityY < -20 || currentY <= 0) {
                this.showNavbar();
            } else if (!this.isOpened && velocityY > 0) {
                this.hideNavbar();
            }

            this.lastScrollY = currentY;
            this.isScrolling = false;
        });
    }

    onClick(e) {
        if (window.innerWidth <= 800) return; // Mobile handled by MobileNavbar

        const clickedInsideNavbar = this.navbarHeader.contains(e.target);
        const clickedLink = e.target.closest("a");

        if (clickedInsideNavbar) {
            if (this.isOpened && !clickedLink) {
                // Close drawer when clicking inside navbar but not on a link
                this.closeDrawer();
            }
            // Allow links to navigate normally - don't prevent default or require double-click
        } else if (this.isOpened) {
            // Close drawer when clicking outside navbar
            this.closeDrawer();
        }
    }

    showNavbar() {
        if (!this.navbarVisible) {
            this.navbar.classList.remove("hide");
            this.navbarVisible = true;
        }
    }

    hideNavbar() {
        if (this.navbarVisible) {
            this.navbar.classList.add("hide");
            this.navbarVisible = false;
        }
    }

    openDrawer() {
        if (this.pageContainer) this.pageContainer.classList.add("navbar-open");
        this.navbar.classList.add("open");
        this.navbarHeader.classList.add("opened");
        this.isOpened = true;
    }

    closeDrawer() {
        if (this.pageContainer) this.pageContainer.classList.remove("navbar-open");
        this.navbar.classList.remove("open");
        this.navbarHeader.classList.remove("opened");
        this.isOpened = false;
    }
}

// Initialize appropriate navbar based on viewport
window.addEventListener("load", () => {
    if (window.innerWidth <= 800) {
        new MobileNavbar();
    } else {
        new DesktopNavbar();
    }

    // Handle viewport changes
    let currentIsMobile = window.innerWidth <= 800;
    window.addEventListener('resize', () => {
        const nowIsMobile = window.innerWidth <= 800;
        if (nowIsMobile !== currentIsMobile) {
            currentIsMobile = nowIsMobile;
            // Reload to reinitialize correct navbar
            location.reload();
        }
    });
});
