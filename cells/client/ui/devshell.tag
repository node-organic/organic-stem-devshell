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
      ChangeClientState,
      FetchReleasedState
    } = require('lib/chemicals')
    const {
      TerminateAll,
      RunCommand
    } = require('lib/chemicals/terminals')
    const {
      TerminateSerialCommand
    } = require('lib/chemicals/serial-commands')


    const ExecuteCellTypes = {
      none: 'none',
      parallel: 'parallel',
      serial: 'serial'
    }

    this.executeToAllCellsType = ExecuteCellTypes.none
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
      switch (this.executeToAllCellsType) {
        case ExecuteCellTypes.parallel:
          window.plasma.emit(ChangeClientState.create({
            runningCommand: value,
            executeType: 'parallel'
          }))
        break
        case ExecuteCellTypes.serial:
        window.plasma.emit(ChangeClientState.create({
          runningCommand: value,
          executeType: 'serial'
        }))
        break
        case ExecuteCellTypes.none:
        default:
          this.state.cells.forEach((cell) => {
            if (cell.focused) {
              window.plasma.emit(RunCommand.create({
                value: value,
                cell: cell
              }))
            }
          })
        break
      }
    }
    this.onCellScriptClick = (script) => {
      return (e) => {
        this.onExecute('npm run ' + script)
      }
    }
    this.onTerminateAll = (e) => {
      if (this.state.executeType === 'serial') {
        window.plasma.emit(TerminateSerialCommand.create())
      } else {
        window.plasma.emit(TerminateAll.create())
      }
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
      window.plasma.emit({type: 'watchKeys', value: 'ctrl+alt+x', global: true}, (c) => {
        if (this.executeToAllCellsType !== ExecuteCellTypes.parallel) {
          this.executeToAllCellsType = ExecuteCellTypes.parallel
        } else {
          this.executeToAllCellsType = ExecuteCellTypes.none
        }
        this.update()
      })
      window.plasma.emit({type: 'watchKeys', value: 'ctrl+alt+z', global: true}, (c) => {
        if (this.executeToAllCellsType !== ExecuteCellTypes.serial) {
          this.executeToAllCellsType = ExecuteCellTypes.serial
        } else {
          this.executeToAllCellsType = ExecuteCellTypes.none
        }
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
    let fetchingReleasedState = false
    this.refreshReleasedState = () => {
      window.plasma.emit(FetchReleasedState.create(), () => {
        fetchingReleasedState = false
        this.update()
      })
      fetchingReleasedState = true
      this.update()
    }
  </script>
  <div if={!this.state.cwd} class='wrapper'>
    <h1>Loading...</h1>
  </div>
  <div if={this.connectionError} class='wrapper'>
    <h1>Connection to server lost...</h1>
  </div>
  <div if={!this.connectionError && this.state.cwd} class='wrapper'>
    <div class='project'>
      <button class='projectShellBtn' onclick={this.toggleProjectShell}>[shell]</button>
      <h1>{this.state.cwd.replace(this.state.userhome, '~')}</h1>
      <button if={!fetchingReleasedState} onclick={this.refreshReleasedState} class='releasedSyncBtn'>
        <i class='material-icons'>
          sync
        </i>
      </button>
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
      <ui-command-input cid='input' enterValue={this.onExecute} />
      <span if={this.state.runningCommand} class='runningCommand'>
        <i if={this.state.executeType === ExecuteCellTypes.parallel} class="material-icons">list</i>
        <i if={this.state.executeType === ExecuteCellTypes.serial} class="material-icons">sort</i>
      </span>
      <div if={this.state.runningCommand} class='runningCommand'>{this.state.runningCommand}</div>
      <button if={this.state.runningCommand} els='terminateBtn'
        onclick={this.onTerminateAll}>
        <i class="material-icons">block</i>
      </button>
      <span class='runningCommand'>
        <i if={this.executeToAllCellsType === ExecuteCellTypes.none} class="material-icons">keyboard_arrow_right</i>
        <i if={this.executeToAllCellsType === ExecuteCellTypes.parallel} class="material-icons">list</i>
        <i if={this.executeToAllCellsType === ExecuteCellTypes.serial} class="material-icons">sort</i>
      </span>
      <div if={this.executeToAllCellsType === ExecuteCellTypes.none} class='scripts cell'>
        <each script in {this.getFocusedCellScripts()}>
          <div class='cellscript' onclick={this.onCellScriptClick(script)}>{script}</div>
        </each>
      </div>
      <div if={this.executeToAllCellsType === ExecuteCellTypes.parallel} class='scripts common'>
        <each script in {this.getCommonCellScripts()}>
          <div class='cellscript' onclick={this.onCellScriptClick(script)}>
              <i class='material-icons'>list</i>
              {script}
          </div>
        </each>
      </div>
      <div if={this.executeToAllCellsType === ExecuteCellTypes.serial} class='scripts common'>
        <each script in {this.getCommonCellScripts()}>
          <div class='cellscript' onclick={this.onCellScriptClick(script)}>
              <i class='material-icons'>sort</i>
              {script}
          </div>
        </each>
      </div>
    </div>
  </div>
</ui-devshell>
