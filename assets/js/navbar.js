class Navbar {
    constructor() {
        this.navbar = document.getElementById("navbar");
        this.navbarHamburger = document.getElementById("hamburger");
        this.navbarDrawer = document.getElementById("navbar-drawer");
        this.navbarHeader = document.getElementById("navbar-header");
        this.pageContainer = document.querySelector(".page-container");

        this.lastScrollY = window.scrollY;
        this.lastInnerHeight = window.innerHeight;
        this.navbarVisible = true;
        this.isOpened = false;
        this.isScrolling = false;


        window.addEventListener("scroll", () => this.onScroll());
        document.addEventListener("click", (e) => this.onClick(e));

        this.observeViewportResize();
    }

    observeViewportResize() {
        window.addEventListener("resize", () => {
            if (window.innerHeight > this.lastInnerHeight) {
                this.showNavbar();
            }
            this.lastInnerHeight = window.innerHeight;
        });
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
        // if (!this.navbarDrawer || !this.navbarDrawer?.computedStyleMap?.().get("display") || this.navbarDrawer?.computedStyleMap?.().get("display") === "none") return

        if (window.innerWidth >= 800) return;

        const clickedInsideNavbar = this.navbarHeader.contains(e.target);
        const clickedLink = e.target.closest("a");

        if (clickedInsideNavbar) {
            if (this.isOpened && !clickedLink) {
                this.closeDrawer();
            } else if (!this.isOpened && clickedLink) {
                this.openDrawer();
                e.preventDefault();
            }
        } else if (!this.navbarHeader.contains(e.target) && this.isOpened) {
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
        this.pageContainer.classList.add("navbar-open");
        this.navbar.classList.add("open");
        // this.navbarDrawer.classList.add("open");
        this.navbarHeader.classList.add("opened");
        this.isOpened = true;
    }

    closeDrawer() {
        this.pageContainer.classList.remove("navbar-open");
        this.navbar.classList.remove("open");
        // this.navbarDrawer.classList.remove("open");
        this.navbarHeader.classList.remove("opened");
        this.isOpened = false;
    }
}

window.addEventListener("load", () => {
    new Navbar();
});
