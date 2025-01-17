import * as esbuild from 'esbuild'
import { snapshot } from '@jsnix/utils/esbuild'
import { walkTree } from '@jsnix/utils/snapshot'
import fs from 'node:fs'

let snapshotPlugin = snapshot({
    root: '../../jnix',
    exclude: ['.git', '.github'],
    transform: async (fs) => {
        const locations = [
            ['@jsnix/utils', 'file:../utils'],
            ['@jsnix/cli', 'file:../cli'],
            ['@jsnix/react', 'file:../react'],
            ['@jsnix/relay', 'file:../relay'],
            ['@jsnix/scripts', 'file:../scripts'],
        ]
        for await (const { name, node, parent } of walkTree(fs)) {
            if (name === 'package-lock.json') {
                delete parent[name]
            }

            if (name === 'package.json' && 'file' in node && 'contents' in node.file) {
                const json = JSON.parse(node.file.contents)
                const { dependencies, devDependencies } = json
                for (const [dep, loc] of locations) {
                    if (dependencies && dependencies[dep]) {
                        dependencies[dep] = loc
                    }
                    if (devDependencies && devDependencies[dep]) {
                        devDependencies[dep] = devDependencies[loc]
                    }
                }
                node.file.contents = JSON.stringify(json, null, 2) + '\n'
            }
        }

        return {
            'jsnix': {
                'directory': fs
            },
            'bin': {
                'directory': {}
            },
            'HELLO.md': {
                file: {
                    contents: `Howdy, stranger! Feel free to poke around.

## Useful commands

\`\`\`sh
jsnix --help
\`\`\`

\`\`\`sh
ls /bin /usr/bin /usr/local/bin
\`\`\`

\`\`\`sh
cat ~/.jshrc
\`\`\`

\`\`\`sh
cd ~/workspace/jsnix/ && npm i && npm run dev
\`\`\`
`
                }
            }
        }
    }
})

const result = await esbuild.build({
    entryPoints: ['index.tsx'],
    outfile: '../assets/js/jsnix.js',
    bundle: true,
    loader: {
        '.ttf': 'file'
    },
    drop: ['debugger'],
    minify: true,
    sourcemap: false,
    metafile: true,
    supported: {
        'top-level-await': true
    },
    plugins: [snapshotPlugin],
    format: 'esm',
    target: 'esnext',
    logLevel: 'info',
    alias: {
        'react': '../../jnix/node_modules/react/',
        'react-dom': '../../jnix/node_modules/react-dom/',
    },
})
fs.writeFileSync('meta.json', JSON.stringify(result.metafile))