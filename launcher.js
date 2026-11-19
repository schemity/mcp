#!/usr/bin/env node
// Finds the installed Schemity desktop app and runs its stdio MCP server.
// The server itself lives in the app; this only locates and starts it.
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const env = process.env
const installed = {
    darwin: [
        '/Applications/Schemity.app/Contents/MacOS/schemity',
        path.join(env.HOME || '', 'Applications/Schemity.app/Contents/MacOS/schemity')
    ],
    win32: [
        path.join(env.LOCALAPPDATA || '', 'Schemity', 'schemity.exe'),
        path.join(env.ProgramFiles || '', 'Schemity', 'schemity.exe')
    ],
    linux: ['/usr/bin/schemity']
}

// SCHEMITY_BIN, when set, is the only place looked at (AppImage, custom install).
const candidates = env.SCHEMITY_BIN ? [env.SCHEMITY_BIN] : installed[process.platform] || []
const bin = candidates.find((p) => fs.existsSync(p))

if (!bin) {
    console.error(
        'Schemity is not installed where schemity-mcp looks for it:\n' +
            candidates.map((p) => `  ${p}\n`).join('') +
            'Install the desktop app from https://schemity.com, or set SCHEMITY_BIN to the path of the schemity binary.'
    )
    process.exit(1)
}

const child = spawn(bin, ['--mcp'], { stdio: 'inherit' })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
child.on('error', (err) => {
    console.error(`Could not start ${bin}: ${err.message}`)
    process.exit(1)
})
child.on('exit', (code) => process.exit(code ?? 1))
