const getTipAmount = () => {
    const search = new URLSearchParams(window.location.search)
    console.log(search)
    return search.get('tip')
}

window.addEventListener('load', () => {
    const tip = getTipAmount()
    console.log(tip)
    const header = document.getElementById('tip-header')
    header.innerText = `🎉 thanks for your $${(tip / 100).toFixed(2)} tip!`
})