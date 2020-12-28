const init = () => {
    const elements = document.querySelectorAll("p a code");
    elements.forEach(element => {
        const grandparent = element.parentNode.parentNode;
        grandparent.setAttribute('style', 'margin:0;')
    })
}

window.addEventListener('load', init);