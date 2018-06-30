<ui-devshell>
  <script>
    require('./cell-group')
    require('./cell')
    require('./command-input')
    require('./command-output')
    require('./devshell.css')

    const {FetchClientState, ClientState, ChangeClientState} = require('chemicals')
    /* this.state === lib/chemicals.ClientState */

    this.onCellSelected = (e) => {
      let cell = e.detail
      window.plasma.emit(ChangeClientState.create(this.state))
    }
    this.onCellGroupSelected = (e) => {
      let group = e.detail
      window.plasma.emit(ChangeClientState.create(this.state))
    }
    this.onExecute = function (e) {
      console.log('EXECUTE', e.detail)
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
        <h2>Groups</h2>
        <each group in ${this.state.groups}>
          <ui-cell-group data=${group} selected=${this.onCellGroupSelected}>
          </ui-cell-group>
        </each>
      </div>
      <div class='cells'>
        <h2>Cells</h2>
        <each cell in ${this.state.cells}>
          <ui-cell data=${cell} selected=${this.onCellSelected}>
            <h3 slot='myText'>${cell.name}</h3>
          </ui-cell>
        </each>
      </div>
      <div class='command-input'>
        <ui-command-input execute=${this.onExecute}></ui-command-input>
      </div>
      <div class='command-output'>
        <ui-command-output cells=${this.state.cells}></ui-command-output>
      </div>
    </div>
  </virtual>
</ui-devshell>
