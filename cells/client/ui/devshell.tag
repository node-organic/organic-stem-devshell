<ui-devshell>
  <script>
    require('./devshell.css')

    require('./cell-group')
    require('./cell-tab')
    require('./cell-output')
    require('./command-input')

    const {
      FetchClientState,
      ClientState,
      ChangeClientState
    } = require('chemicals')
    const {
      TerminateAll,
      RunCommand
    } = require('chemicals/terminals')
    /* this.state === lib/chemicals.ClientState */

    this.onCellSelected = (cell) => {
      let isFirstSelectedCell = true
      this.state.cells.forEach((c) => {
        if (c.selected) isFirstSelectedCell = false
      })
      cell.selected = !cell.selected
      if (isFirstSelectedCell) cell.focused = true
      window.plasma.emit(ChangeClientState.create(this.state))
    }
    this.onCellFocused = (focusedCell) => {
      this.state.cells.forEach((cell) => {
        if (cell.name !== focusedCell.name) {
          cell.focused = false
        } else {
          cell.focused = !cell.focused
        }
      })
      window.plasma.emit(ChangeClientState.create(this.state))
    }
    this.onCellGroupSelected = (group) => {
      group.selected = !group.selected
      window.plasma.emit(ChangeClientState.create(this.state))
    }
    this.onExecuteToAll = function (value) {
      window.plasma.emit(ChangeClientState.create({
        runningCommand: value
      }))
    }
    this.onExecuteToFocused = (value) => {
      this.state.cells.forEach((cell) => {
        if (cell.focused) {
          window.plasma.emit(RunCommand.create({
            value: value,
            cell: cell
          }))
        }
      })
    }
    this.onTerminateAll = function (e) {
      window.plasma.emit(TerminateAll.create())
    }
    this.hasSelectedCell = () => {
      let result = false
      this.state.cells.forEach(c => {
        if (c.selected) result = true
      })
      return result
    }
    window.plasma.on(ClientState.type, (c) => {
      this.setState(c)
    })
    this.on('mounted', () => {
      window.plasma.emit(FetchClientState.create())
    })
    this.getCellTabClass = () => {
      return this.state.cells.length > 3 ? '' : 'flexAutoGrow'
    }
  </script>
  <div if={this.state.cwd} class='wrapper'>
    <div class='project'>
      <h1>{this.state.cwd.replace(this.state.userhome, '~')}</h1>
    </div>
    <div class='groups'>
      <each group in {this.state.groups}>
        <ui-cell-group key={group.name} group={group} selected={this.onCellGroupSelected} />
      </each>
    </div>
    <div class='cells'>
      <div class='cell-tabs'>
        <each cell in {this.state.cells}>
          <ui-cell-tab cell={cell}
            class={this.getCellTabClass()}
            selected={this.onCellSelected}
            focused={this.onCellFocused} />
        </each>
      </div>
      <div class='cell-outputs'>
        <each cell in {this.state.cells}>
          <ui-cell-output cell={cell} />
        </each>
      </div>
    </div>
    <div class='command-input'>
      <ui-command-input
        executeToAll={this.onExecuteToAll}
        executeToFocused={this.onExecuteToFocused}
        terminateAll={this.onTerminateAll}
        value={this.state.runningCommand} />
    </div>
  </div>
</ui-devshell>
