class Shelp {
    constructor(terminal, filesystem, environment) {
        this.terminal = terminal
        this.filesystem = filesystem
        this.environment = environment
        this.path = '/bin/'

        terminal.on('stdin', (input) => {
            console.log('blash hearing input', input)
            const split = input.split('|')

            split.forEach(cmd => {
                
                if (cmd == "echo") {
                    var file = this.filesystem.getFile('/bin/echo')
                    console.log(file)
                    var result = this.executeWithWrappedConsole(file.exec, {})
                }
            })
        })
    }

    executeWithWrappedConsole(fn, options) {
        const previous = window.console
        const self = this
        const wrapper = (previousConsole) => {
            
            return {
                log: function() {
                    previousConsole.log(arguments)
                    self.terminal.writeLine(arguments[0])
                }
            }
        }
        window.console = wrapper(window.console)
        fn(options)
        window.console = previous
    }
}

export {
    Shelp
}