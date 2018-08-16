<ui-devshell>
  <script>
    require('./devshell.css')

    require('./cell-group')
    require('./cell-tab')
    require('./cell-output')
    require('./command-input')

    const _ = require('lodash')

    const {
      FetchClientState,
      ClientState,
      ChangeClientState
    } = require('chemicals')
    const {
      TerminateAll,
      RunCommand
    } = require('chemicals/terminals')

    this.onCellSelected = (cell) => {
      cell.selected = !cell.selected
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
    this.getFocusedCell = () => {
      return _.find(this.state.cells, 'focused')
    }
    this.getCommonCellScripts = () => {
      let filter = _.filter(this.state.cells, 'selected')
      let arr = _.map(filter, (c) => {
        return _.keys(c.scripts)
      })
      let result = _.intersection.apply(_, arr)
      return result
    }
    this.onCellGroupSelected = (group) => {
      return () => {
        // cant use the group as reference
        // seems JS passes it as cloned object
        // therefore `group.selected = !group.selected`
        // wont work here and instead we need to do
        this.state.groups.forEach((g) => {
          if (g.name === group.name) {
            g.selected = !g.selected
          }
        })
        window.plasma.emit(ChangeClientState.create(this.state))
      }
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
    this.onCommonScriptClick = (script) => {
      return (e) => {
        this.onExecuteToAll('npm run ' + script)
      }
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
      <div class='proxyurl'>
        <a href={'http://localhost:' + window.DNA.devproxy.port} target="_blank">
          http://localhost:{window.DNA.devproxy.port}/
        </a>
      </div>
      <h1>{this.state.cwd.replace(this.state.userhome, '~')}</h1>
    </div>
    <div class='groups'>
      <each group in {this.state.groups}>
        <ui-cell-group key={group.name} group={group} onclick={this.onCellGroupSelected(group)} />
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
          <ui-cell-output
            cell={cell}
            executeToAll={this.onExecuteToAll}
            executeToFocused={this.onExecuteToFocused} />
        </each>
      </div>
    </div>
    <div if={this.hasSelectedCell()} class='command-input'>
      <div if={!this.state.runningCommand} class='scripts common'>
        <each script in {this.getCommonCellScripts()}>
          <div class='cellscript' onclick={this.onCommonScriptClick(script)}>{script}</div>
        </each>
      </div>
      <ui-command-input
        executeToAll={this.onExecuteToAll}
        executeToFocused={this.onExecuteToFocused}
        terminateAll={this.onTerminateAll}
        prop-value={this.state.runningCommand} />
    </div>
  </div>
</ui-devshell>
