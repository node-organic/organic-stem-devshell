<ui-project-shell>
  <script>
    require('./index.css')
    require('../xterm')
    require('els')(this)
    const _ = require('lodash')
    const {
      CommandOutput,
      CommandInput,
      Resize
    } = require('lib/chemicals/project-shell')
    this.handleKeypress = (char) => {
      window.plasma.emit(CommandInput.create({
        char: char
      }))
    }
    this.handleResize = (e) => {
      window.plasma.emit(Resize.create({
        rows: e.rows,
        cols: e.cols
      }))
    }
    this.xtermReady = () => {
      if (!this.props.focused) {
        this.hide()
      }
    }
    this.show = function () {
      this.el.classList.remove('hidden')
    }
    this.hide = function () {
      this.el.classList.add('hidden')
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
  <ui-xterm els='xterm' ready={this.xtermReady} keypressed={this.handleKeypress} onxtermresize={this.handleResize} />
</ui-project-shell>
