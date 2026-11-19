const test = require('node:test')
const assert = require('node:assert')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const launcher = path.join(__dirname, 'launcher.js')
const run = (bin, input) =>
    spawnSync(process.execPath, [launcher], {
        env: { ...process.env, SCHEMITY_BIN: bin },
        input,
        encoding: 'utf8'
    })

test('a missing binary exits 1 and names the download page', () => {
    const r = run('/nonexistent/schemity')
    assert.strictEqual(r.status, 1)
    assert.match(r.stderr, /schemity\.com/)
    assert.strictEqual(r.stdout, '')
})

test('the binary gets --mcp, stdin and stdout pass through, exit code is kept', { skip: process.platform === 'win32' }, () => {
    const fake = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'schemity-mcp-')), 'schemity')
    fs.writeFileSync(fake, '#!/bin/sh\necho "$1"\ncat\nexit 3\n', { mode: 0o755 })
    const r = run(fake, 'ping\n')
    assert.strictEqual(r.stdout, '--mcp\nping\n')
    assert.strictEqual(r.status, 3)
})
