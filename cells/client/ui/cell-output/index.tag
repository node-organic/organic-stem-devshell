<ui-cell-output>
  <script>
    const {
      TerminateCommand,
      CommandInput,
      CommandOutput,
      CommandTerminated,
      CommandStarted,
      Resize
    } = require('lib/chemicals/terminals')
    const {
      ChangeCellState
    } = require('lib/chemicals')
    require('./index.css')
    require('../xterm')
    require('els')(this)
    this.xtermReady = () => {
      if (!this.props.cell.focused) {
        this.hide()
      }
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

    this.on('mounted', () => {
      window.plasma.on(CommandStarted.byCell(this.props.cell), (c) => {
        this.els('xterm').component.write(c.chunk)
      })
      window.plasma.on(CommandOutput.byCell(this.props.cell), (c) => {
        this.els('xterm').component.write(c.chunk)
      })
    })
    window.plasma.emit({type: 'watchKeys', value: 'ctrl+space'}, () => {
      if (this.props.cell.focused) {
        this.els('xterm').component.scrollToBottom()
      }
    })
    window.plasma.emit({type: 'watchKeys', value: 'ctrl+shift+c', global: true}, (e) => {
      if (this.props.cell.focused) {
        e.preventDefault()
        this.onTerminateCellCommands()
      }
    })
  </script>
  <div class='oneline'>
    <div if={this.props.cell.commandRunning} class='stop' onclick={this.onTerminateCellCommands}>
      <i class="material-icons">block</i>
    </div>
    <div>
      port: {this.props.cell.port} | mount point: {this.props.cell.mountPoint}
    </div>
  </div>
  <ui-xterm els='xterm' ready={this.xtermReady} keypressed={this.handleKeypress} onxtermresize={this.handleResize} />
</ui-cell-output>
