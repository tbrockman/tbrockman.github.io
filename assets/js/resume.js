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
    const lengthBefore = elements[0].clientWidth

    dashes += "-"
    elements[0].innerHTML = dashTemplate(dashes)
    const lengthAfter = elements[0].clientWidth 

    const delta = lengthAfter - lengthBefore
    let fill = Math.floor((width - lengthAfter) / delta)

    while (fill > 0) {
        dashes += "-"
        fill--
    }
    elements[0].innerHTML = dashTemplate(dashes)

    elements.forEach(element => {
        element.innerHTML = dashTemplate(dashes)
    })
}

window.addEventListener('load', init);
window.addEventListener('resize', init)