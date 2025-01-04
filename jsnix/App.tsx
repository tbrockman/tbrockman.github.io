import React, { useState, useEffect } from 'react'
import { Jsnix, JsnixOptions } from "@jsnix/react"
import '@jsnix/react/assets/index.css'
import { WrappedJsnixExports, loadJsnixExports } from '@jsnix/utils/osc'

export default function App() {
    const [jsnixExports, setJsnixExports] = useState<WrappedJsnixExports[]>([])
    const options: JsnixOptions = {
        env: {
            PATH: '/home/workspace/bin:/bin:/usr/bin:/usr/local/bin',
            NODE_OPTIONS: '--no-warnings',
        },
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
        // bootstrap: [
        //   {
        //     cmd: ["npm", "i"],
        //     options: {
        //       cwd: "/jsnix",
        //       output: false
        //     }
        //   },
        //   {
        //     cmd: ["npm", "run", "build"],
        //     options: {
        //       cwd: "/jsnix",
        //       output: false
        //     }
        //   },
        //   {
        //     cmd: ["ln", "-s", "../jsnix/packages/cli/dist/cli/index.js", "jsnix"],
        //     options: {
        //       cwd: "/bin",
        //       output: false
        //     }
        //   }
        // ],
        entrypoint: ['jsnix'],
        jsnixExports,
    }

    const loadSnapshot = async () => {
        // @ts-ignore
        const module = await import('@jsnix/snapshot')
        return module.default
    }

    const loadExports = async () => {
        const modules: Record<string, () => Promise<unknown>> = {
            code: function code() { return import("./node_modules/@jsnix/cli/dist/cli/commands/code/_app/jsnix") },
            div: function div() { return import("./node_modules/@jsnix/cli/dist/cli/commands/div/_app/jsnix") },
            listen: function listen() { return import("./node_modules/@jsnix/cli/dist/cli/commands/listen/_app/jsnix") },
            recruit: function recruit() { return import("./node_modules/@jsnix/cli/dist/cli/commands/recruit/_app/jsnix") }
        }

        const mods = await loadJsnixExports(modules)
        setJsnixExports(mods.filter((module) => module !== null))
    }

    useEffect(() => {
        loadExports()
    }, [])

    return (
        <>
            <Jsnix
                fs={loadSnapshot}
                options={options}
            />
        </>
    )
}