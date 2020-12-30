import { Executable } from './filesystem.js'

class Shelp {
    constructor(terminal, filesystem, environment) {
        this.terminal = terminal
        this.filesystem = filesystem
        this.environment = environment
        this.paths = ['/bin', '/usr/bin']

        terminal.on('stdin', (input) => {
            console.log('blash hearing input', input)
            const split = input.split('|')

            split.forEach(cmd => {
                
                const args = cmd.split(' ')
                const executable = this.findExecutableInPaths(args[0])

                if (executable) {
                    const result = this.executeWithWrappedConsole(executable.exec, args, {})
                }
                else {
                    this.terminal.writeLine(args[0] + ": command not found")
                }
            })
        })
    }

    findExecutableInPaths(name) {
        
        for (let i = 0; i < this.paths.length; i++) {
            const path = this.paths[i]
            const folder = this.filesystem.getFile(path)
            const executables = folder.getFiles(Executable)
            const executable = executables.find(ex => ex.name == name)

            if (executable) {
                return executable
            }
        }

        return null
    }

    executeWithWrappedConsole(fn, args, options) {
        const previous = window.console
        const self = this
        const wrapper = (previousConsole) => {
            
            return {
                log: function() {
                    previousConsole.log(arguments[0])
                    self.terminal.writeLine(arguments[0])
                }
            }
        }
        window.console = wrapper(window.console)
        fn(args, options)
        window.console = previous
    }
}

export {
    Shelp
}