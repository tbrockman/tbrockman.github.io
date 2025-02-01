const entrypoint = (args, options, fds=[]) => {
    
    let output = "\n"

    if (args.length > 1) {
        output = args.slice(1).join(' ')
    }

    fds.STDOUT.writeLines([
        output
    ])
}

export {
    entrypoint
}