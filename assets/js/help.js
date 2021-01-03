import { Executable } from './filesystem.js'

const entrypoint = (args, options, fds=[]) => {
    const paths = window.environment['PATH'].split(';')
    const output = new Set(['clear', 'cd'])

    paths.forEach(path => {
        const folder = window.filesystem.getFile(path)

        folder.getFiles(Executable).forEach(exec => {
            output.add(exec.name)
        })
    })

    fds.STDOUT.writeLines([
        '\n',
        'These are the commands that are currently available: \n',
        '\n',
        ...output,
        '\n',
        'WARNING: Everything is a barebones implementation here, these are not the commands you\'re used to.',
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