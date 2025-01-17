import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { snapshot } from '@jsnix/utils/vite';
import { walkTree } from '@jsnix/utils/snapshot';

export default defineConfig({
    base: './',
    cacheDir: '../../node_modules/.vite',
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
            root: '../../', transform: async (tree) => {
                const locations = [
                    ['@jsnix/utils', 'file:../utils'],
                    ['@jsnix/cli', 'file:../cli'],
                    ['@jsnix/react', 'file:../react'],
                    ['@jsnix/relay', 'file:../relay'],
                    ['@jsnix/scripts', 'file:../scripts'],
                ];
                for (const { name, node, parent } of walkTree(tree)) {
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
    ],
    define: {
        APP_VERSION: JSON.stringify(process.env['npm_package_version']),
    },
});
