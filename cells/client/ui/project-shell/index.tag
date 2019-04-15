<ui-project-shell>
  <script>
    require('./index.css')
    require('../xterm')
    require('els')(this)
    const _ = require('lodash')
    const {
      CommandOutput,
      CommandInput,
      RequestScripts,
      Execute,
      Resize
    } = require('lib/chemicals/project-shell')
    this.scripts = []
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
      window.plasma.emit(RequestScripts.create(), (err, c) => {
        this.scripts = c.scripts
        this.update()
      })
    })
    this.onScriptClick = (script) => {
      return () => {
        this.execute('npm run ' + script)
      }
    }
    this.execute = (value) => {
      window.plasma.emit(Execute.create({
        value: value
      }))
    }
  </script>
  <div class='scripts'>
    <each script in {_.keys(this.scripts)}>
      <div class='script' onclick={this.onScriptClick(script)}>
          {script}
      </div>
    </each>
  </div>
  <ui-xterm els='xterm' ready={this.xtermReady} keypressed={this.handleKeypress} onxtermresize={this.handleResize} />
</ui-project-shell>
