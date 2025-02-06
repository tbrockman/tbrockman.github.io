class Navbar {

    constructor() {
        this.navbarHamburger = document.getElementById("hamburger")
        this.navbarDrawer = document.getElementById("navbar-drawer")
        this.navbarHeader = document.getElementById("navbar-header")
        this.pageContainer = document.getElementsByClassName("page-container")[0]
        this.navbar = document.getElementById("navbar")
        this.y = window.scrollY;
        this.velocityY = 0;
        this.accelerationY = 0;
        this.jerkY = 0;

        window.addEventListener("scroll", () => {
            this.onScroll()
        })

        document.addEventListener("click", (e) => {

            if (this.navbarHeader.contains(e.target)) {

                if (this.isOpened) {
                    this.closeDrawer()
                }
                else {
                    this.openDrawer()
                }
            }

            else if (!this.navbarDrawer.contains(e.target)) {
                if (this.isOpened) {
                    this.closeDrawer()
                }
            }
        })
    }

    showNavbar() {
        this.navbar.classList.remove("hide")
        this.navbarShown = !!!this.navbarShown
    }

    hideNavbar() {
        this.navbar.classList.add("hide")
        this.navbarShown = !!!this.navbarShown
    }

    onScroll(threshold = 30) {
        const y = window.scrollY
        const velocityY = y - this.y
        const accelerationY = velocityY - this.velocityY
        const jerkY = accelerationY - this.accelerationY


        if (((-jerkY) > threshold && velocityY < 0) || y === 0) {
            this.showNavbar()
        }
        else if (!this.isOpened && document.body.scrollHeight > document.body.clientHeight && velocityY > 0 && y > 0) {
            this.hideNavbar()
        }
        this.y = y
        this.velocityY = velocityY
        this.accelerationY = accelerationY
        this.jerkY = jerkY
    }

    openDrawer() {
        this.pageContainer.classList.add("navbar-open")
        this.navbar.classList.add("open")
        this.navbarDrawer.classList.add("open")
        this.navbarHeader.classList.add("opened")
        this.isOpened = !!!this.isOpened
    }

    closeDrawer() {
        this.pageContainer.classList.remove("navbar-open")
        this.navbar.classList.remove("open")
        this.navbarDrawer.classList.remove("open")
        this.navbarHeader.classList.remove("opened")
        this.isOpened = !!!this.isOpened
    }
}

let navbar;

window.addEventListener("load", () => {
    navbar = new Navbar()
})