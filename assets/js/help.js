import { Executable } from './filesystem.js'

const entrypoint = (args, options, fds=[]) => {
    const paths = window.environment['PATH'].split(';')
    const output = new Set(['help', 'clear'])

    // paths.forEach(path => {
    //     const folder = window.filesystem.getFile(path)

    //     folder.getFiles(Executable).forEach(exec => {
    //         output.add(exec.name)
    //     })
    // })

    fds.STDOUT.writeLines([
        '\n',
        '<b>NOTE:</b> This started as an exercise in front-end development, and is (unfortunately) <b>not</b> a fully-functioning terminal.\n',
        'There is no real interpreter, no kernel, and no filesystem.\n',
        'It is very much a work in progress.\n',
        '\n',
        'These are the commands that are currently available: \n',
        '\n',
        ...output,
        '\n',
    ])

    return {
        'stdout': [
            '\n',
            'These are the commands that are currently available: \n',
            '\n',
            ...output,
            '\n',
            'WARNING: Everything is a barebones implementation here, these are not the commands you\'re used to.',
            '\n',
        ]
    }
}

export {
    entrypoint
}