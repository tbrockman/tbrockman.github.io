import * as esbuild from 'esbuild'
import { snapshot } from '@jsnix/utils/esbuild'

let snapshotPlugin = snapshot({
    root: '../../jnix',
    transform: (fs) => {
        return {
            'jsnix': {
                'directory': fs
            },
            'bin': {
                'directory': {}
            }
        }
    }
})

await esbuild.build({
    entryPoints: ['index.tsx'],
    outfile: '../assets/js/jsnix.js',
    bundle: true,
    loader: {
        '.ttf': 'file'
    },
    drop: ['debugger'],
    minify: true,
    sourcemap: true,
    metafile: true,
    plugins: [snapshotPlugin],
    format: 'esm',
    target: 'esnext',
    logLevel: 'info'
})