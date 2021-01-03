const entrypoint = (args, options, fds=[]) => {
    
    const paths = args.slice(1)
    
    paths.forEach(path => {
        const file = window.filesystem.getFile(path)
        console.log(file.data.toString())
        fds.STDOUT.writeLines([file.data.toString()])
    })
}

export {
    entrypoint
}