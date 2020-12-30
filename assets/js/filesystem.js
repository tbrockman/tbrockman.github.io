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
}

class Executable extends File {
    constructor(name, data, metadata={}) {
        super(name, data, Executable, metadata)
        this.exec = data
    }

    execute(options) {
        console.log(this)
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
    MarkdownFile
}