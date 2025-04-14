const init = () => {
    const elements = document.querySelectorAll("p > a > code.language-plaintext.highlighter-rouge");
    elements.forEach(element => {
        // TODO: just apply CSS classes here instead of inline styles

        const grandparent = element.parentNode.parentNode;

        if (grandparent.nextElementSibling && grandparent.nextElementSibling.className.includes('language-')) {
            element.style.fontSize = '1rem';
            element.style.display = 'flex';
            element.style.border = '4px solid #0a0a0a';
            element.style.borderBottom = 'none';
            element.style.setProperty('padding', '8px 16px', 'important')

            grandparent.style.marginBottom = '0';

            const pre = grandparent.nextElementSibling.querySelector('pre')
            pre.style.borderTop = 'none';
            element.classList.add('filename');
        }
    })
}

window.addEventListener('load', init);