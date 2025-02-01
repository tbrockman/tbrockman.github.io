import { useState, useEffect } from 'react'
import { Jsnix, JsnixOptions } from "@jsnix/react"
import '@jsnix/react/assets/index.css'
import { WrappedJsnixExports, loadJsnixExports } from '@jsnix/utils/osc'
import chalk from 'chalk'
chalk.level = 3

import JSONWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CSSWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HTMLWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TSWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

export type WorkerName = string;
const workers = {} as Record<WorkerName, Worker>;
const getWorker = (label: string) => {
    switch (label) {
        case 'json': return new JSONWorker();
        case 'scss':
        case 'less':
        case 'css': return new CSSWorker();
        case 'html':
        case 'handlebars':
        case 'razor': return new HTMLWorker()
        case 'typescript':
        case 'javascript': return new TSWorker()
        default: return new EditorWorker()
    }
};

self.MonacoEnvironment = {
    getWorker: function (_, label) {
        if (label in workers) {
            return workers[label];
        }
        const worker = getWorker(label);
        workers[label] = worker;
        return worker;
    },
};

export default function App() {
    const [jsnixExports, setJsnixExports] = useState<WrappedJsnixExports[] | undefined>(undefined)
    const options: JsnixOptions = {
        env: {
            PATH: '/home/workspace/bin:/bin:/usr/bin:/usr/local/bin',
            NODE_OPTIONS: '--no-warnings --experimental-global-webcrypto',
        },
        prompt: [
            '',
            '',
            `\x1b]80085;data;1d655ba9-0832-46f6-9fc8-6c2cdd3c3af5;eyJodG1sIjoiPGRpdiBzdHlsZT1cIndpZHRoOiAxMDAlO1xuXHRkaXNwbGF5OiBmbGV4O1xuXHRib3gtc2l6aW5nOiBib3JkZXItYm94O1xuXHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcblx0cGFkZGluZzogMXJlbTtcIj5cblx0PGRpdiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICMzODM4Mzg7XG5cdFx0XHRcdGJveC1zaGFkb3c6IC0xcmVtIDFyZW0gIzE3MTcxNztcblx0XHRcdFx0cGFkZGluZzogMXJlbTtcblx0XHRcdFx0cGFkZGluZy1ib3R0b206IDJyZW07XG5cdFx0XHRcdHdoaXRlLXNwYWNlOiBwcmUtd3JhcDtcblx0XHRcdFx0Zm9udC1mYW1pbHk6IG1vbm9zcGFjZTtcblx0XHRcdFx0Y29sb3I6IHdoaXRlO1xuXHRcdFx0XHRib3JkZXI6IDRweCBzb2xpZCAjMGEwYTBhO1xuXHRcdFx0XHR3aWR0aDogMTAwJTtcblx0XHRcdFx0ZGlzcGxheTogZmxleDtcblx0XHRcdFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcblx0XHRcdFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cdFx0XHRcdGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuXHRcdFx0XHRsaW5lLWhlaWdodDogaW5pdGlhbDtcIj5cbuKWiOKWiOKWiOKWiOKWiOKWiOKWiOKWiOKVl+KWiOKWiOKVlyAg4paI4paI4pWX4paI4paI4paI4paI4paI4paI4paI4pWXIOKWiOKWiOKWiOKWiOKWiOKWiOKVlyBcbuKVmuKVkOKVkOKWiOKWiOKVlOKVkOKVkOKVneKWiOKWiOKVkSAg4paI4paI4pWR4paI4paI4pWU4pWQ4pWQ4pWQ4pWQ4pWd4paI4paI4pWU4pWQ4pWQ4pWQ4paI4paI4pWXXG4gICDilojilojilZEgICDilojilojilojilojilojilojilojilZHilojilojilojilojilojilZcgIOKWiOKWiOKVkSAgIOKWiOKWiOKVkVxuICAg4paI4paI4pWRICAg4paI4paI4pWU4pWQ4pWQ4paI4paI4pWR4paI4paI4pWU4pWQ4pWQ4pWdICDilojilojilZEgICDilojilojilZFcbiAgIOKWiOKWiOKVkSAgIOKWiOKWiOKVkSAg4paI4paI4pWR4paI4paI4paI4paI4paI4paI4paI4pWX4pWa4paI4paI4paI4paI4paI4paI4pWU4pWdXG4gICDilZrilZDilZ0gICDilZrilZDilZ0gIOKVmuKVkOKVneKVmuKVkOKVkOKVkOKVkOKVkOKVkOKVnSDilZrilZDilZDilZDilZDilZDilZ1cblxuXG4gICAgIGRldiDwn5K7IGFydGlzdCDwn46oIGdvb2Yg8J+koVxuPC9kaXY+PC9kaXY+In0=\x07`,
            '',
            `press any key to ${chalk.greenBright('start')}`,
        ],
        bootstrap: [
            {
                cmd: ['npm', 'i', '@jsnix/cli'],
                options: {
                    cwd: '/bin',
                },
            },
            {
                cmd: ['ln', '-s', 'node_modules/@jsnix/cli/dist/cli/index.js', 'jsnix'],
                options: {
                    cwd: '/bin',
                },
            },
        ],
        entrypoint: ['jsnix'],
        jsnixExports
    }

    const loadSnapshot = async () => {
        const module = await import('virtual:@jsnix/snapshot');
        return {
            'jsnix': {
                directory: module.default,
            },
            'bin': {
                directory: {},
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
`,
                },
            },
        };
    };

    const loadExports = async () => {
        const modules = import.meta.glob('./node_modules/@jsnix/cli/commands/**/_app/jsnix.{js,jsx,ts,tsx}');
        const exported = await loadJsnixExports(modules);
        setJsnixExports(exported.filter((module) => module !== null));
    };

    useEffect(() => {
        loadExports();
    }, []);

    if (jsnixExports === undefined) {
        return null;
    }

    return (
        <Jsnix
            fs={loadSnapshot}
            options={options}
        />
    );
}