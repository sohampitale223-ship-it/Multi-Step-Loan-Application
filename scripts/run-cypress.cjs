const { spawn } = require('node:child_process')
const path = require('node:path')

const environment = { ...process.env }
delete environment.ELECTRON_RUN_AS_NODE

const processHandle = spawn(process.execPath, [path.resolve('node_modules/cypress/bin/cypress'), process.argv[2] || 'run', ...process.argv.slice(3)], {
  env: environment,
  stdio: 'inherit',
})

processHandle.on('exit', (code) => process.exit(code ?? 1))
