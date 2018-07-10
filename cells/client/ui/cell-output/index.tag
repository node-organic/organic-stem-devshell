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
      if (!this.props.cell.focused) {
        this.hide()
      }
    }
    this.show = function () {
      if (!this.shadowRoot) return
      this.shadowRoot.classList.remove('hidden')
    }
    this.hide = function () {
      if (!this.shadowRoot) return
      this.shadowRoot.classList.add('hidden')
    }
    this.handleKeypress = (char) => {
      window.plasma.emit(CommandInput.create({
        char: char,
        cell: this.props.cell
      }))
    }
    this.on('updated', () => {
      if (this.props.cell.focused) {
        this.show()
      } else {
        this.hide()
      }
    })
    this.on('mounted', () => {
      window.plasma.on(CommandStarted.byCell(this.props.cell), (c) => {
        this.shadowRoot.component.write(c.chunk)
      })
      window.plasma.on(CommandOutput.byCell(this.props.cell), (c) => {
        this.shadowRoot.component.write(c.chunk)
      })
    })
  </script>
  <ui-xterm ready={this.xtermReady} keypressed={this.handleKeypress} />
</ui-cell-output>
