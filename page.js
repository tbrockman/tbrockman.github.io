import { Terminal } from './assets/js/terminal.js'
import { Shelp } from './assets/js/shelp.js'
import { Filesystem, MarkdownFile, Folder, Executable } from './assets/js/filesystem.js'
import { entrypoint as Echo } from './assets/js/echo.js'
import { entrypoint as Help } from './assets/js/help.js'
import { entrypoint as Cat } from './assets/js/cat.js'
import { entrypoint as Ls } from './assets/js/ls.js'
import { entrypoint as Youtube } from './assets/js/youtube.js'

const initializePage = () => {
    //initializeAdjectives()
    const element = document.getElementById('terminal')
    const user = {
        name: 'theodore brockman'
    }
    const environment = { 
        'PATH': '/bin;/usr/bin'
    }
    window.environment = environment
    const bin = new Folder('bin')
    
    // TODO: get javascript executable (as string)
    // and unsafe eval (no way this could go wrong!)
    const echo = new Executable('echo', Echo)
    const help = new Executable('help', Help)
    const ls = new Executable('ls', Ls)
    const cat = new Executable('cat', Cat)
    const youtube = new Executable('youtube', Youtube)
    bin.addFile(echo)
    bin.addFile(help)
    bin.addFile(ls)
    bin.addFile(cat)
    bin.addFile(youtube)

    const usr = new Folder('usr')
    const usrbin = new Folder('bin')
    usr.addFile(usrbin)

    const etc = new Folder('etc')
    const shells = new Folder('shells')
    etc.addFile(shells)

    const home = new Folder('home')
    const readme = new MarkdownFile('README.md', {})
    home.addFile(readme)

    const root = new Folder('')
    root.addFile(bin)
    root.addFile(usr)
    root.addFile(etc)
    root.addFile(home)

    const filesystem = new Filesystem('webpage')
    filesystem.mount('/', root)
    window.filesystem = filesystem

    const terminal = new Terminal(user, element)
    const shelp = new Shelp(terminal, filesystem, environment)
}

window.addEventListener('load', initializePage);
window.addEventListener('hashchange', initializePage);