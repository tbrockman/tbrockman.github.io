class File {
    constructor(name, data=[], metadata={}) {
        this.name = name
        this.data = data
        this.metadata = metadata
    }
}

class Folder {
    constructor(children=[], metadata={}) {
        this.children = children
        this.metadata = metadata
    }

    appendChild(child) {
        this.children.append(child)
    }
}

class Filesystem {
    constructor(root, graph={}) {
        this.root = root
        this.graph = graph
    }

    storeNode(key, node) {
        this.graph[key] = node
    }
}

class Terminal {

    constructor(filesystem, user, environment, element) {
        this.filesystem = filesystem
        this.user = user
        this.environment = environment
        this.element = element
        this.emutermLogo = `███████╗███╗   ███╗██╗   ██╗████████╗███████╗██████╗ ███╗   ███╗        ██╗███████╗
██╔════╝████╗ ████║██║   ██║╚══██╔══╝██╔════╝██╔══██╗████╗ ████║        ██║██╔════╝
█████╗  ██╔████╔██║██║   ██║   ██║   █████╗  ██████╔╝██╔████╔██║        ██║███████╗
██╔══╝  ██║╚██╔╝██║██║   ██║   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║   ██   ██║╚════██║
███████╗██║ ╚═╝ ██║╚██████╔╝   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██╗╚█████╔╝███████║
╚══════╝╚═╝     ╚═╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝ ╚════╝ ╚══════╝
`
        this.lines = [
            "Welcome " + navigator.userAgent + "\n",
            "\n",
            "The current date is " + new Date() + "\n",
            "\n",
            "\n",
            "\n",
            "This terminal brought to you by\n",
            "\n",
            this.emutermLogo,
            "\n",
            "\t\t\ta Javascript terminal emulator created by @tbrockman\n",
            "\n",
            "\n"
        ]
        this.cursor = 0
        this.input = ""
        this.workdir = "~"

        const root = document.createElement('div')
        this.root = root;
        root.contentEditable = true
        root.classList.add('terminal-input')

        root.addEventListener("paste", e => {
            let paste = (e.clipboardData || window.clipboardData).getData('text');
            // TODO: process lines (execute commands)
            this.inserTextAtPosition(paste, this.cursor)
            e.preventDefault()
        })

        root.addEventListener("keypress", (e) => {
            // console.log("keypress", e)
            if (e.key == "Enter") {
                this.lines.push(this.buildContext() + this.input + "\n")
                this.context = ""
                this.input = ""
                this.cursor = 0
                this.render()
            }
            else {
                this.inserTextAtPosition(e.key, this.cursor)
            }
            e.preventDefault()
        })
        root.addEventListener("keydown", (e) => {
            console.log(e)
            if (e.key == "Backspace") {
                this.deleteCharacterAtPosition(this.cursor)
                e.preventDefault()
            }

            if (e.ctrlKey) {
            }
        })
        root.addEventListener("input", (e) => {
            console.log(e)
            if (e.inputType == "deleteContentBackward") {
                console.log(this.cursor)
                this.deleteCharacterAtPosition(this.cursor)
            }
            e.preventDefault()
        })
        element.replaceWith(root)

        this.render()
    }
    
    deleteCharacterAtPosition(position) {
        console.log('deleting at: ', position)
        if (position > 0) {
            const text = this.input.slice(0, position-1) + this.input.slice(position)
            this.cursor -= 1
            this.renderInput(text)
        }
    }

    inserTextAtPosition(text, position) {
        const nextInput = this.input.slice(0, position) + text + this.input.slice(position + 1)
        this.cursor += text.length
        this.renderInput(nextInput)
    }

    render(input = "") {

        // TODO: only render visible lines on terminal

        // render historical lines

        // render our current input line

        this.renderHistory()
        this.renderInput(input)
    }

    renderHistory() {
        let text = this.lines.join('')
        this.root.innerText = text
    }

    renderCaret() {
        
        if (this.caretElement) {
            this.caretElement.remove()
        }
        this.caretElement = document.createElement('div')
        this.caretElement.innerText = "█"
        this.caretElement.style.display = "inline-block"
        this.root.appendChild(this.caretElement)
    }

    buildContext() {
        return this.user.name + ":" + this.workdir + "$ "
    }

    renderInput(nextInput) {
        if (this.context) {
            this.root.innerText = this.root.innerText.slice(0, this.root.innerText.length - (this.context.length + this.input.length + 1))
        }
        else {
            this.root.innerText = this.root.innerText.slice(0, this.root.innerText.length - this.input.length + 1)
            this.context = this.buildContext()
        }
        this.root.innerText += (this.context + nextInput)
        this.input = nextInput
        this.renderCaret()
    }

    getInputLineText() {
        return ""
    }

    onCommandEntered(command) {
        const output = this.executeCommand(command)
        this.writeLines(output)
        this.render()
    }

    executeCommand(command) {
        console.log(command)
    }

    writeLines(lines) {
        this.lines += lines
    }
}

window.addEventListener('load', () => {
    const element = document.getElementById('terminal')
    console.log(element)
    const user = {
        name: 'theodore brockman'
    }
    const environment = {}
    const filesystem = new Filesystem()
    const root = new Folder([], {name: '/'})
    filesystem.storeNode('/', root)
    const terminal = new Terminal(filesystem, user, environment, element)
})
