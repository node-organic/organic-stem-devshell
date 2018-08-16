<ui-cell-output>
  <script>
    const {
      TerminateCommand,
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
      this.shadowRoot.classList.remove('hidden')
    }
    this.hide = function () {
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

    this.getCellScripts = () => {
      let cellScripts = this.props.cell.scripts
      let result = []
      for (let key in cellScripts) {
        result.push({name: key, value: cellScripts[key]})
      }
      return result
    }

    this.onTerminateCellCommands = () => {
      window.plasma.emit(TerminateCommand.byCell(this.props.cell))
    }

    this.onCellScriptClick = (script) => {
      return (e) => {
        if (!e.shiftKey) {
          this.props.executeToFocused('npm run ' + script.name)
        } else {
          this.props.executeToAll('npm run ' + script.name)
        }
      }
    }

    this.on('mounted', () => {
      window.plasma.on(CommandStarted.byCell(this.props.cell), (c) => {
        this.els('xterm').component.write(c.chunk)
      })
      window.plasma.on(CommandOutput.byCell(this.props.cell), (c) => {
        this.els('xterm').component.write(c.chunk)
      })
    })
  </script>
  <div>
    port: {this.props.cell.port} | mount point: {this.props.cell.mountPoint}
    <div if={!this.state.runningCommand} class='scripts'>
      <div if={this.props.cell.commandRunning} class='cellscript' onclick={this.onTerminateCellCommands}>
        <i class="material-icons">block</i>
      </div>
      <each script in {this.getCellScripts()}>
        <div class='cellscript' onclick={this.onCellScriptClick(script)}>{script.name}</div>
      </each>
    </div>
  </div>
  <ui-xterm els='xterm' ready={this.xtermReady} keypressed={this.handleKeypress} />
</ui-cell-output>
