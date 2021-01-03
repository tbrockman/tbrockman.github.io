class File {
    constructor(name, data, type, createdOn=new Date(), updatedOn=new Date(), metadata={}) {
        this.name = name
        this.data = data
        this.type = type
        this.metadata = metadata
        this.createdOn = createdOn
        this.updatedOn = updatedOn 
    }

    serialize() {
        //TODO: inodes
        throw new Error("serialize not implemented for file of type: ", this.type)
    }

    deserialize() {
        throw new Error("deserialize not implement for file of type: ", this.type)
    }

    read() {
        throw new Error("read is not implemented for file of type: ", this.type)
    }

    write() {
        throw new Error("write is not implemented for file of type: ", this.type)
    }

    writeLines() {
        throw new Error("writeLines is not implemented for file of type: ", this.type)
    }
}

class Pipe extends File {

    constructor(name, data={}, metadata={}) {
        super(name, data, Pipe, metadata)
    }

    read() {
        let temp = this.buffer
        this.buffer = []
        return temp
    }

    write(bytes) {
        this.onWriteBytes(bytes)
    }

    writeLines(lines) {
        lines.forEach(line => {
            this.onWriteLine(line)
        })
    }
}

class Filesystem extends File {
    constructor(name, data={}, metadata={}) {
        super(name, data, Filesystem, metadata)
        this.graph = data
    }

    mount(key, file, path="", visited=new Set()) {
        const absolutePath = path + key

        if (!visited.has(absolutePath)) {
        
            this.graph[absolutePath] = file
            visited.add(absolutePath)

            if (file.type == Folder) {

                for (const [name, child] of Object.entries(file.children)) {
                    this.mount(name, child, absolutePath == '/' ? absolutePath : absolutePath + '/', visited)
                }
            }
        }
    }

    getFile(path) {
        return this.graph[path]
    }

    exists(path) {
        console.log(this.graph)
        return path in this.graph
    }

    serialize() {
        return this.graph
    }
}

class Folder extends File {
    constructor(name, data={}, metadata={}) {
        super(name, data, Folder, metadata)
        this.children = data
    }

    addFile(file) {
        //TODO: do something if file already exists
        this.children[file.name] = file
    }

    getFiles(type=null) {
        let files = []

        for (const [name, child] of Object.entries(this.children)) {

            if (type == null || child.type == type) {
                files.push(child)
            }
        }

        return files
    }
}

class Executable extends File {
    constructor(name, data, metadata={}) {
        super(name, data, Executable, metadata)
        this.exec = data
    }

    execute(options) {
        return this.exec(options)
    }
}

class MarkdownFile extends File {
    constructor(name, data, metadata={}) {
        super(name, data, MarkdownFile, metadata)
    }

    render() {

    }
}

export {
    File,
    Folder,
    Executable,
    Filesystem,
    MarkdownFile,
    Pipe
}