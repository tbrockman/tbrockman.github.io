const entrypoint = (args, options, fds=[]) => {
    
    const re = /v=([\w\d]*)/
    const watch = args[1]
    const matches = watch.match(re)
    console.log(matches[1])
    
    const embed = `<iframe width="560" height="315" src="${"https://www.youtube.com/embed/" + matches[1]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    fds.STDOUT.writeLines([embed])
}

export {
    entrypoint
}