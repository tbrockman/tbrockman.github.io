const entrypoint = (args, options) => {
    
    let output = "\n"
    if (args.length > 1) {
        output = args[1]
    }
    console.log(output)
}

export {
    entrypoint
}