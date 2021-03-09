const init = () => {
    const elements = document.querySelectorAll("p a code");
    elements.forEach(element => {
        const grandparent = element.parentNode.parentNode;
        grandparent.setAttribute('style', 'margin:0;')

        if (grandparent.nextSibling) {
            const grandSibling = grandparent.nextSibling.nextElementSibling;
            const adjacentCodeBlock = grandSibling.firstChild.firstChild;
            adjacentCodeBlock.setAttribute('style', 'border-top:0;')
        }
    })
}

window.addEventListener('load', init);