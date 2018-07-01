<ui-devshell>
  <script>
    require('./devshell.css')

    require('./cell-group')
    require('./cell-tab')
    require('./cell-output')
    require('./command-input')

    const {FetchClientState, ClientState, ChangeClientState} = require('chemicals')
    /* this.state === lib/chemicals.ClientState */

    this.onCellSelected = (e) => {
      let cell = e.detail
      cell.selected = !cell.selected
      if (!cell.selected) cell.focused = false
      window.plasma.emit(ChangeClientState.create(this.state))
    }
    this.onCellFocused = (e) => {
      this.state.cells.forEach((cell) => {
        cell.focused = false
      })
      let cell = e.detail
      cell.focused = true
      this.update()
    }
    this.onCellGroupSelected = (e) => {
      let group = e.detail
      window.plasma.emit(ChangeClientState.create(this.state))
    }
    this.onExecute = function (e) {
      window.plasma.emit(ChangeClientState.create({
        runningCommand: e.detail
      }))
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
          <ui-cell-group data=${group} selected=${this.onCellGroupSelected} />
        </each>
      </div>
      <div class='cells'>
        <div class='cell-tabs'>
          <each cell in ${this.state.cells}>
            <ui-cell-tab data=${cell}
              selected=${this.onCellSelected}
              focused=${this.onCellFocused} />
          </each>
        </div>
        <div class='cell-outputs'>
          <each cell in ${this.state.cells}>
            <ui-cell-output data=${cell} />
          </each>
        </div>
      </div>
      <div class='command-input'>
        <ui-command-input execute=${this.onExecute} value=${this.state.runningCommand} />
      </div>
    </div>
  </virtual>
</ui-devshell>
