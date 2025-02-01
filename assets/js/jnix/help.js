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
        `
<div style="border: dashed 1px #fff;width: fit-content;padding: 1em;"><b>NOTE:</b> This started as an exercise in front-end development
and is (unfortunately) <b>not</b> a fully-functioning terminal.
There is no real interpreter, no kernel, and no filesystem.
The goal is to write the above completely in browser
... but it is very much a work in progress.
</div>

`,
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