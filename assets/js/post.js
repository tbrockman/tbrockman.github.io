const init = () => {
    const elements = document.querySelectorAll("p a code");
    elements.forEach(element => {
        const grandparent = element.parentNode.parentNode;
        grandparent.setAttribute('style', 'margin:0;')
    })
    console.log(elements)
}

window.addEventListener('load', init);