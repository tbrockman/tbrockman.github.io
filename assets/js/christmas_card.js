const carousel = (current_index, images) => {
    console.log(images[current_index])
    const container = document.getElementById('photo-container')
    container.innerHTML = ""
    const image = document.createElement("img")
    image.classList.add("christmas-image")
    image.classList.add("faded-out")
    image.src = images[current_index]
    container.appendChild(image)

    requestAnimationFrame(() => {
        console.log('removing')
        image.classList.remove("faded-out")
    })

    setTimeout(() => {
        carousel(((current_index + 1 % images.length) + images.length) % images.length, images)
    }, 5000) 
}

function fisherYates( array ){
    var count = array.length,
        randomnumber,
        temp;
    while( count ){
     randomnumber = Math.random() * count-- | 0;
     temp = array[count];
     array[count] = array[randomnumber];
     array[randomnumber] = temp
    }
   }

window.addEventListener('load', () => {
    let base = "https://tbrockman-christmas-card-2020.s3-us-west-1.amazonaws.com/"
    let imageCount = 37
    let images = []

    for (let i = 1; i < imageCount; i++) {
        images.push(base + i + '.jpg')
    }

    fisherYates(images)
    carousel(0, images)
})