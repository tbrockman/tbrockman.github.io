import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { snapshot } from '@jsnix/utils/vite';
import { traverse } from '@jsnix/utils/filesystemtree';
import { rename } from 'node:fs/promises';
import { resolve } from 'node:path';

export default defineConfig({
    base: './',
    cacheDir: './node_modules/.vite',
    build: {
        outDir: '../assets/jsnix',
        emptyOutDir: true,
        minify: 'esbuild'
    },
    esbuild: {
        supported: {
            'top-level-await': true, // browsers can handle top-level-await features
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            target: 'esnext',
            format: 'esm',
        },
    },
    plugins: [
        snapshot({
            root: '../',
            transform: async (tree) => {
                const locations = [
                    ['@jsnix/utils', 'file:../utils'],
                    ['@jsnix/cli', 'file:../cli'],
                    ['@jsnix/react', 'file:../react'],
                    ['@jsnix/relay', 'file:../relay'],
                    ['@jsnix/scripts', 'file:../scripts'],
                ];
                for (const { name, node, parent } of traverse(tree)) {
                    if (name === 'package-lock.json') {
                        delete parent[name];
                    }

                    if (name === 'package.json' && 'file' in node && 'contents' in node.file) {
                        const json = JSON.parse(node.file.contents as string);
                        const { dependencies, devDependencies } = json;
                        for (const [dep, loc] of locations) {
                            if (dependencies && dependencies[dep]) {
                                dependencies[dep] = loc;
                            }
                            if (devDependencies && devDependencies[dep]) {
                                devDependencies[dep] = devDependencies[loc];
                            }
                        }
                        node.file.contents = JSON.stringify(json, null, 2) + '\n';
                    }
                }
                return tree;
            },
        }),
        react(),
        // Code which works for now but could definitely break in the future
        {
            name: 'rewrite-html-paths',
            transformIndexHtml: (html) => {
                return html.replaceAll('./assets/', 'assets/jsnix/assets/')
            },
        },
        {
            name: 'move-index-html',
            writeBundle: async (_, bundle) => {
                if ('index.html' in bundle) {
                    const index = bundle['index.html'];
                    const src = resolve('../assets/jsnix/index.html');
                    const dest = resolve('../_layouts/home.html');
                    console.log(index.fileName, src, dest)
                    await rename(src, dest);
                }
            }
        }
    ]
});
