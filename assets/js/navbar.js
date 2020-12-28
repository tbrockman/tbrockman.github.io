class Navbar {

    constructor() {
        this.navbarHamburger = document.getElementById("hamburger")
        this.navbarDrawer = document.getElementById("navbar-drawer")
        this.navbarHeader = document.getElementById("navbar-header")
        this.pageContainer = document.getElementsByClassName("page-container")[0]
        this.navbar = document.getElementById("navbar")
        this.lastY = window.pageYOffset;

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
        this.navbarShown = !!! this.navbarShown
    }

    hideNavbar() {
        this.navbar.classList.add("hide")
        this.navbarShown = !!! this.navbarShown
    }

    onScroll() {
        const currentY = window.pageYOffset

        if (this.lastY > currentY) {
            this.showNavbar()
        }
        else if (!this.isOpened) {
            this.hideNavbar()
        }
        this.lastY = currentY
    }

    openDrawer() {
        this.pageContainer.classList.add("navbar-open")
        this.navbar.classList.add("open")
        this.navbarDrawer.classList.add("open")
        this.navbarHeader.classList.add("opened")
        this.isOpened = !!! this.isOpened
    }

    closeDrawer() {
        this.pageContainer.classList.remove("navbar-open")
        this.navbar.classList.remove("open")
        this.navbarDrawer.classList.remove("open")
        this.navbarHeader.classList.remove("opened")
        this.isOpened = !!! this.isOpened
    }
}

let navbar;

const test = (e) => {
    e.preventDefault()
}

window.addEventListener("load", () => {
    navbar = new Navbar()
})