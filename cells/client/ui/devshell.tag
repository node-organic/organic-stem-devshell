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

    this.onCellSelected = (e) => {
      let cell = e.detail
      let isFirstSelectedCell = true
      this.state.cells.forEach((c) => {
        if (c.selected) isFirstSelectedCell = false
      })
      cell.selected = !cell.selected
      if (isFirstSelectedCell) cell.focused = true
      window.plasma.emit(ChangeClientState.create(this.state))
    }
    this.onCellFocused = (e) => {
      this.state.cells.forEach((cell) => {
        if (cell.name !== e.detail.name) {
          cell.focused = false
        } else {
          cell.focused = !cell.focused
        }
      })
      window.plasma.emit(ChangeClientState.create(this.state))
    }
    this.onCellGroupSelected = (e) => {
      let group = e.detail
      group.selected = !group.selected
      window.plasma.emit(ChangeClientState.create(this.state))
    }
    this.onExecuteToAll = function (e) {
      window.plasma.emit(ChangeClientState.create({
        runningCommand: e.detail
      }))
    }
    this.onExecuteToFocused = (e) => {
      this.state.cells.forEach((cell) => {
        if (cell.focused) {
          window.plasma.emit(RunCommand.create({
            value: e.detail,
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
      this.shouldUpdate(c)
    })
    this.on('mounted', () => {
      window.plasma.emit(FetchClientState.create())
    })
  </script>
  <virtual>
    <div if=${this.state.cwd} class='wrapper'>
      <div class='project'>
        <h1>${this.state.cwd.replace(this.state.userhome, '~')}</h1>
      </div>
      <div class='groups'>
        <each group in ${this.state.groups}>
          <ui-cell-group group=${group} selected=${this.onCellGroupSelected} />
        </each>
      </div>
      <div class='cells'>
        <div class='cell-tabs'>
          <each cell in ${this.state.cells}>
            <ui-cell-tab cell=${cell}
              selected=${this.onCellSelected}
              focused=${this.onCellFocused} />
          </each>
        </div>
        <div class='cell-outputs'>
          <each cell in ${this.state.cells}>
            <ui-cell-output cell=${cell} />
          </each>
        </div>
      </div>
      <div class='command-input' if=${this.hasSelectedCell() === true}>
        <ui-command-input
          executeToAll=${this.onExecuteToAll}
          executeToFocused=${this.onExecuteToFocused}
          terminateAll=${this.onTerminateAll}
          value=${this.state.runningCommand} />
      </div>
    </div>
  </virtual>
</ui-devshell>
