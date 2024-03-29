<ui-cell-output>
  <script>
    const {
      TerminateCommand,
      RestartCommands,
      CommandInput,
      CommandOutput,
      CommandTerminated,
      CommandStarted,
      Resize
    } = require('lib/chemicals/terminals')
    const {
      ChangeCellState
    } = require('lib/chemicals')
    const {
      WatchKeys
    } = require('client-plasma/combokeys/chemicals')

    require('./index.css')
    require('../xterm')
    require('client-lib/els')(this)
    this.xtermReady = (e) => {
      if (!this.props.cell.focused) {
        this.hide()
      }
      window.plasma.emit(Resize.create({
        cell: this.props.cell,
        rows: e.rows,
        cols: e.cols
      }))
    }
    this.show = function () {
      this.el.classList.remove('hidden')
    }
    this.hide = function () {
      this.el.classList.add('hidden')
    }
    this.handleKeypress = (char) => {
      window.plasma.emit(CommandInput.create({
        char: char,
        cell: this.props.cell
      }))
    }
    this.handleResize = (e) => {
      window.plasma.emit(Resize.create({
        cell: this.props.cell,
        rows: e.rows,
        cols: e.cols
      }))
    }
    this.on('updated', () => {
      if (this.props.cell.focused) {
        this.show()
      } else {
        this.hide()
      }
    })

    this.onTerminateCellCommands = () => {
      window.plasma.emit(TerminateCommand.byCell(this.props.cell))
    }
    this.onRestartCellCommands = () => {
      window.plasma.emit(RestartCommands.byCell(this.props.cell))
    }

    this.on('mounted', () => {
      window.plasma.on(CommandStarted.byCell(this.props.cell), (c) => {
        this.props.cell.runningCommandsCount = c.cell.runningCommandsCount
        this.els('xterm').component.write(c.chunk)
        this.update()
      })
      window.plasma.on(CommandOutput.byCell(this.props.cell), (c) => {
        this.els('xterm').component.write(c.chunk)
      })
      window.plasma.on(CommandTerminated.byCell(this.props.cell), (c) => {
        this.props.cell.runningCommandsCount = c.cell.runningCommandsCount
        this.update()
      })
      window.plasma.on('focusterminal', (c) => {
        if (this.props.cell.focused) {
          this.els('xterm').component.scrollToBottom()
          this.els('xterm').component.gainFocus()
        }
      })
      window.plasma.on('clearterminal', (c) => {
        if (this.props.cell.focused) {
          this.els('xterm').component.clear()
        }
      })
    })
    window.plasma.emit(
      WatchKeys.create({ 
        value: 'ctrl+space', 
        global: true, 
        callback: () => {
          if (this.props.cell.focused) {
            this.els('xterm').component.scrollToBottom()
          }
        }
      })
    )
    window.plasma.emit(
      WatchKeys.create({ 
        value: 'ctrl+shift+c',
        global: true, 
        callback: () => {
          if (this.props.cell.focused) {
            e.preventDefault()
            this.onTerminateCellCommands()
          }
        }
      })
    )
    this.handleCellnameClick = (e) => {
      let el = this.els('cellname')
      if (el && window.getSelection && document.createRange) {
        let selection = window.getSelection()
        let range = document.createRange()
        range.selectNodeContents(el)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  </script>
  <div class='oneline'>
    <i class='material-icons large'>rounded_corner</i>
    <div>
      name: <span els='cellname' onclick={this.handleCellnameClick}>{this.props.cell.name}</span> | port: {this.props.cell.port} | mount point: {this.props.cell.mountPoint}
    </div>
    <div if={this.props.cell.commandRunning} class='stop' onclick={this.onTerminateCellCommands}>
      <i class="material-icons">block</i> {this.props.cell.runningCommandsCount}
    </div>
    <div if={this.props.cell.runningCommandsCount === 1} class='restart' onclick={this.onRestartCellCommands}>
      <i class="material-icons">loop</i>
    </div>
  </div>
  <ui-xterm els='xterm' ready={this.xtermReady} 
    keypressed={this.handleKeypress} 
    onxtermresize={this.handleResize} />
</ui-cell-output>
