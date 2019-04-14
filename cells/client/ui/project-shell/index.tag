<ui-project-shell>
  <script>
    require('./index.css')
    require('../xterm')
    require('els')(this)
    const {
      CommandOutput,
      CommandInput
    } = require('lib/chemicals/project-shell')
    this.handleKeypress = (char) => {
      window.plasma.emit(CommandInput.create({
        char: char,
        cell: this.props.cell
      }))
    }
    this.xtermReady = () => {
      if (!this.props.focused) {
        this.hide()
      }
    }
    this.show = function () {
      this.shadowRoot.classList.remove('hidden')
    }
    this.hide = function () {
      this.shadowRoot.classList.add('hidden')
    }
    this.on('updated', () => {
      if (this.props.focused) {
        this.show()
      } else {
        this.hide()
      }
    })
    this.on('mounted', () => {
      window.plasma.on(CommandOutput.type, (c) => {
        this.els('xterm').component.write(c.chunk)
      })
    })
  </script>
  <ui-xterm els='xterm' ready={this.xtermReady} keypressed={this.handleKeypress} />
</ui-project-shell>
