module.exports = class TerminateCommand {
  constructor (pid) {
    this.type = 'TerminateCommand'
    this.pid = pid
  }
}
