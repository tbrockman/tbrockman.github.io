const init = () => {
    const elements = document.querySelectorAll("p > a > code.language-plaintext.highlighter-rouge");
    elements.forEach(element => {
        const grandparent = element.parentNode.parentNode;



        const styleLink = `display: flex;
        flex: 1;
        border-bottom: none;
        padding: 8px 16px !important;
        font-size: 1rem;`
        const styleLinkGrandparent = `margin-bottom: 0;`
        const styleLinkGrandSiblingPre = `border-top: none;`

        if (grandparent.nextElementSibling && grandparent.nextElementSibling.className.includes('language-')) {
            element.style.borderBottom = 'none';
            element.style.fontSize = '1rem';
            element.style.display = 'flex';
            element.style.setProperty('padding', '8px 16px', 'important')

            grandparent.style.marginBottom = '0';

            const pre = grandparent.nextElementSibling.querySelector('pre')
            console.log(pre)

            pre.style.borderTop = 'none';
            // grandparent.setAttribute('style', 'margin:0;')
            // const grandSibling = grandparent.nextSibling.nextElementSibling;
            // const adjacentCodeBlock = grandSibling.firstChild.firstChild;
            // adjacentCodeBlock.setAttribute('style', 'border-top:0;')
        }
    })
}

window.addEventListener('load', init);