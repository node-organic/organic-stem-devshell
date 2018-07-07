<ui-cell-output>
  <script>
    const {
      CommandInput,
      CommandOutput,
      CommandTerminated,
      CommandStarted
    } = require('chemicals/terminals')
    require('./index.css')
    require('./xterm')
    require('els')(this)
    this.xtermReady = () => {
      setTimeout(() => {
        if (!this.state.cell.focused) {
          this.hide()
        }
      }, 100)
    }
    this.show = function () {
      this.els('xterm').classList.remove('hidden')
    }
    this.hide = function () {
      this.els('xterm').classList.add('hidden')
    }
    this.handleKeypress = (e) => {
      window.plasma.emit(CommandInput.create({
        char: e.detail,
        cell: this.state.cell
      }))
    }
    this.on('updated', () => {
      if (!this.mounted) return
      if (this.state.cell.focused) {
        this.show()
      } else {
        this.hide()
      }
    })
    this.on('mounted', () => {
      window.plasma.on(CommandStarted.byCell(this.state.cell), (c) => {
        this.els('xterm').write(c.chunk)
      })
      window.plasma.on(CommandOutput.byCell(this.state.cell), (c) => {
        this.els('xterm').write(c.chunk)
      })
    })
  </script>
  <ui-xterm els='xterm' ready=${this.xtermReady} keypressed=${this.handleKeypress} />
</ui-cell-output>
