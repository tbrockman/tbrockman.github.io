class Shelp {
    constructor(terminal) {
        this.terminal = terminal
        
        terminal.on('stdin', (input) => {
            console.log('blash hearing input', input)
        })
    }
}

export {
    Shelp
}