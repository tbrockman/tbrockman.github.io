import { Kernel } from '/assets/js/jnix/kernel.js'

const initializePage = () => {
    const kernel = new Kernel()
}

window.addEventListener('load', initializePage);
window.addEventListener('hashchange', initializePage);