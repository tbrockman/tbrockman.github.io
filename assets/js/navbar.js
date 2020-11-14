class Navbar {

    constructor() {
        this.navbarHamburger = document.getElementById("hamburger")
        this.navbarDrawer = document.getElementById("navbar-drawer")
        this.navbarHeader = document.getElementById("navbar-header")
        this.navbar = document.getElementById("navbar")
        document.addEventListener("click", (e) => {

            if (this.navbarHeader.contains(e.target) || (!this.navbarDrawer.contains(e.target))) {
                
                if (this.isOpened) {
                    this.closeDrawer()
                }
                else {
                    this.openDrawer()
                }
            }
        })
    }

    openDrawer() {
        this.navbarDrawer.classList.add("open")
        this.navbarHeader.classList.add("opened")
        this.isOpened = !!! this.isOpened
    }

    closeDrawer() {
        this.navbarDrawer.classList.remove("open")
        this.navbarHeader.classList.remove("opened")
        this.isOpened = !!! this.isOpened
    }
}

let navbar;

window.addEventListener("load", () => {
    navbar = new Navbar()
})

const test = (e) => {
    e.preventDefault()
}