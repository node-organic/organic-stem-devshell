const pty = require('node-pty')
const path = require('path')
const terminate = require('terminate')

const {
  CommandInput,
  CommandOutput,
  RequestScripts,
  Scripts,
  Execute,
  Resize
} = require('lib/chemicals/project-shell')

module.exports = class ProjectShellOrganelle {
  constructor (plasma, dna) {
    if (!dna.PRJROOT || dna.PRJROOT === 'undefined') throw new Error('missing dna.PRJROOT')
    this.plasma = plasma
    this.dna = dna
    this.projectRoot = path.resolve(dna.PRJROOT)
    this.plasma.on(CommandInput.type, (c) => {
      this.child.write(c.char)
    })
    this.plasma.on(Resize.type, (c) => {
      this.child.resize(c.cols, c.rows)
    })
    this.plasma.on(Execute.type, (c) => {
      this.child.write(c.value + '\r')
    })
    this.plasma.on(RequestScripts.type, (c) => {
      try {
        const packagejson = require(path.join(this.projectRoot, 'package.json'))
        this.plasma.emit(Scripts.create({ scripts: packagejson.scripts }))
      } catch (e) {
        // ignore
      }
    })
    this.plasma.on('kill', () => {
      terminate(this.child.pid)
    })
    this.scripts = []
    this.startShell()
  }

  startShell () {
    const cwd = path.join(this.projectRoot)
    const envCopy = Object.assign({}, process.env)
    delete envCopy.CELL_MODE
    envCopy.COLORTERM = 'truecolor'
    const child = pty.spawn('sh', [], {
      name: this.projectRoot,
      cols: 800,
      rows: 240,
      cwd: cwd,
      env: envCopy
    })
    child.on('data', (chunk) => {
      this.plasma.emit(CommandOutput.create({
        chunk: chunk
      }))
    })
    child.on('close', (statusCode) => {
      process.exit(statusCode)
    })
    this.child = child
    console.info('[project-shell]', this.projectRoot)
  }
}
