const dashTemplate = (a) => {
    return `/* ${a} */`
}

const init = () => {
    const resumeContainer = document.getElementsByClassName('resume-container')[0]

    let dashes = "-"
    let string = dashTemplate(dashes)
    const width = resumeContainer.clientWidth

    const elements = document.querySelectorAll(".section-separator");
    elements[0].innerHTML = string
    console.log(elements[0].clientWidth)
    console.log(elements[0].innerHTML)

    while (elements[0].clientWidth < width - 50) {
        dashes += "-"
        elements[0].innerHTML = dashTemplate(dashes)
    }

    elements.forEach(element => {
        element.innerHTML = dashTemplate(dashes)
    })
}

window.addEventListener('load', init);
window.addEventListener('resize', init)