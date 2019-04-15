<ui-devshell>
  <script>
    require('./devshell.css')

    require('./cell-group')
    require('./cell-tab')
    require('./cell-output')
    require('./command-input')
    require('./project-shell')

    const _ = require('lodash')

    const {
      FetchClientState,
      ClientState,
      ChangeClientState
    } = require('lib/chemicals')
    const {
      TerminateAll,
      RunCommand
    } = require('lib/chemicals/terminals')

    this.executeToAllCells = false
    this.connectionError = false

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
    this.getFocusedCellScripts = () => {
      let focusedCell = this.getFocusedCell()
      if (!focusedCell) return []
      return _.keys(focusedCell.scripts)
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
    this.onExecute = (value) => {
      if (this.executeToAllCells) {
        this.onExecuteToAll(value)
      } else {
        this.onExecuteToFocused(value)
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
    this.onCellScriptClick = (script) => {
      return (e) => {
        this.onExecuteToFocused('npm run ' + script)
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
      window.plasma.emit({type: 'watchKeys', value: 'alt', action: 'keydown', global: true}, (c) => {
        this.executeToAllCells = true
        this.update()
      })
      window.plasma.emit({type: 'watchKeys', value: 'alt', action: 'keyup', global: true}, (c) => {
        this.executeToAllCells = false
        this.update()
      })
      window.plasma.on('IO', (c) => {
        c.io.on('disconnect', () => {
          this.connectionError = true
          this.update()
        })
      })
    })
    this.getCellTabClass = () => {
      return this.state.cells.length > 3 ? '' : 'flexAutoGrow'
    }
    this.projectShellFocused = false
    this.toggleProjectShell = () => {
      this.projectShellFocused = !this.projectShellFocused
      this.update()
    }
  </script>
  <div if={this.connectionError} class='wrapper'>
    <h1>Connection to server lost...</h1>
  </div>
  <div if={!this.connectionError && this.state.cwd} class='wrapper'>
    <div class='project'>
      <button class='projectShellBtn' onclick={this.toggleProjectShell}>[shell]</button><h1>{this.state.cwd.replace(this.state.userhome, '~')}</h1>
    </div>
    <div class='projectShell'>
      <ui-project-shell prop-focused={this.projectShellFocused} />
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
            cell={cell} />
        </each>
      </div>
    </div>
    <div class='command-input' >
      <ui-command-input cid='input'
        enterValue={this.onExecute}
        prop-executeToAllCells={this.executeToAllCells}
        prop-runningCommand={this.state.runningCommand} />
      <button if={this.state.runningCommand} els='terminateBtn'
        onclick={this.onTerminateAll}>
        <i class="material-icons">block</i>
      </button>
      <div if={!this.executeToAllCells} class='scripts cell'>
        <each script in {this.getFocusedCellScripts()}>
          <div class='cellscript' onclick={this.onCellScriptClick(script)}>{script}</div>
        </each>
      </div>
      <div if={this.executeToAllCells} class='scripts common'>
        <each script in {this.getCommonCellScripts()}>
          <div class='cellscript' onclick={this.onCommonScriptClick(script)}>
              <i class='material-icons'>
                check_circle
              </i>
              {script}
          </div>
        </each>
      </div>
    </div>
  </div>
</ui-devshell>
