import { Executable, Pipe, Folder } from './filesystem.js'

class Shelp {
    constructor(terminal, filesystem, environment) {
        this.terminal = terminal
        this.filesystem = filesystem
        this.environment = environment
        this.stdout = new Pipe(0, [])
        this.stdout.onWriteLine = (line) => {
            this.terminal.writeLine(line)
        }
        this.stdin = new Pipe(1, [])
        this.stderr = new Pipe(2, [])

        this.openFileDescriptors = {
            STDOUT: this.stdout,
            STDIN: this.stdin,
            STDERR: this.stderr
        }
        this.paths = environment['PATH'].split(';')

        terminal.on('stdin', (input) => {
            console.log('blash hearing input', input)
            const split = input.split('|')

            split.forEach(cmd => {
                const args = cmd.split(' ')

                if (args[0] == "clear") {
                    return this.clearTerminal()
                }
                else if (args[0] == "cd") {
                    const path = args[1]
                    
                    if (this.filesystem.exists(path)) {
                        const file = this.filesystem.getFile(path)

                        if (file.type == Folder) {
                            this.changeWorkingDirectory(path)
                        }
                        else {
                            this.terminal.writeLine(args[1] + ': No such file or directory')
                        }
                    }
                }
                else {
                    const executable = this.findExecutableInPaths(args[0])

                    if (executable) {
                        executable.exec(args, {}, this.openFileDescriptors)
                    }
                    else {
                        this.terminal.writeLine(args[0] + ": command not found")
                    }
                }
            })
        })
    }

    changeWorkingDirectory() {

    }

    getOpenFileDescriptors() {
        return this.openFileDescriptors
    }

    clearTerminal() {
        this.terminal.clear()
    }

    findExecutableInPaths(name) {
        // TOOD: potential optimization, binary search on paths and files within paths        
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
}

export {
    Shelp
}