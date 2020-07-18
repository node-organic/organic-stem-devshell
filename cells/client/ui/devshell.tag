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
    const {
      RequestScripts,
      Execute: ProjectExecute
    } = require('lib/chemicals/project-shell')
    const {
      WatchKeys
    } = require('plasma/combokeys/chemicals')
    const {
      RunFrontCommand
    } = require('plasma/front-commands')

    require('els')(this)

    const ExecuteCellTypes = {
      none: 'none',
      parallel: 'parallel',
      serial: 'serial'
    }

    this.executeToAllCellsType = ExecuteCellTypes.none
    this.connectionError = false
    this.scripts = []

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
    this.onExecute = (c) => {
      let value = c.cmd
      if (c.ctrlKey) {
        window.plasma.emit(RunFrontCommand.create({
          value: value,
          devshell: this
        }))
        return
      }
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
      this.executeToAllCellsType = ExecuteCellTypes.none
      this.update()
    }
    this.onCellScriptClick = (script) => {
      return (e) => {
        this.onExecute({cmd: 'npm run ' + script})
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
      window.plasma.emit(RequestScripts.create(), (err, c) => {
        this.scripts = c.scripts
        this.update()
      })
      window.plasma.emit(
        WatchKeys.create({
          value: 'ctrl+alt+x', 
          global: true,
          callback: (c) => {
            if (this.executeToAllCellsType !== ExecuteCellTypes.parallel) {
              this.executeToAllCellsType = ExecuteCellTypes.parallel
            } else {
              this.executeToAllCellsType = ExecuteCellTypes.none
            }
            this.update()
          }
        })
      )
      window.plasma.emit(
        WatchKeys.create({
          value: 'ctrl+alt+z', 
          global: true, 
          callback: (c) => {
            if (this.executeToAllCellsType !== ExecuteCellTypes.serial) {
              this.executeToAllCellsType = ExecuteCellTypes.serial
            } else {
              this.executeToAllCellsType = ExecuteCellTypes.none
            }
            this.update()
          }
        })
      )
      window.plasma.emit(
        WatchKeys.create({
          value: 'ctrl+space',
          global: true,
          callback: () => {
            this.els('cmdinput').component.gainFocus()
          }
        })
      )
      window.plasma.emit(
        WatchKeys.create({
          value: 'escape',
          global: true,
          callback: () => {
            this.els('cmdinput').component.looseFocus()
          }
        })
      )
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
    this.onProjectScriptClick = (script) => {
      return () => {
        if (!this.projectShellFocused) {
          this.projectShellFocused = true
          this.update()
        }
        window.plasma.emit(ProjectExecute.create({
          value: 'npm run ' + script
        }))
      }
    }
    this.getCellsPerGroup = function (group) {
      let result = []
      this.state.cells.forEach(function (cell) {
        if (cell.groups[0] === group.name) {
          result.push(cell)
        }
      })
      return result
    }
    this.isGroupVirtual = function (group) {
      let result = []
      this.state.cells.forEach(function (cell) {
        if (cell.groups[0] === group.name) {
          result.push(cell)
        }
      })
      return result.length === 0
    }
    this.getCellGroups = function () {
      let result = []
      this.state.groups.forEach((group) => {
        if (this.isGroupVirtual(group)) return
        result.push(group)
      })
      return result
    }
    this.getCellVirtualGroups = function () {
      let result = []
      this.state.groups.forEach((group) => {
        if (!this.isGroupVirtual(group)) return
        result.push(group)
      })
      return result
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
      <button class='projectShellBtn' onclick={this.toggleProjectShell}>
        <i class='material-icons projectShellBtnIcon'>donut_large</i>
      </button>
      <h1>{this.state.cwd.replace(this.state.userhome, '~')}</h1>
      <button if={!fetchingReleasedState} onclick={this.refreshReleasedState} class='releasedSyncBtn'>
        <i class='material-icons releasedSyncBtnIcon'>
          sync
        </i>
      </button>
    </div>
    <div class='projectShell'>
      <ui-project-shell prop-focused={this.projectShellFocused} />
      <div class='scripts'>
        <each script in {_.keys(this.scripts)}>
          <div class='script' onclick={this.onProjectScriptClick(script)}>
              {script}
          </div>
        </each>
      </div>
    </div>
    <vsplit-pane>
      <div class='groups virtualgroups'>
        <each group in {this.getCellVirtualGroups()}>
          <ui-cell-group key={group.name} group={group} onclick={this.onCellGroupSelected(group)} />
        </each>
      </div>
      <div class='groups'>
        <each group in {this.getCellGroups()}>
          <div>
            <ui-cell-group key={group.name} group={group} onclick={this.onCellGroupSelected(group)} />
            <div class='cell-tabs'>
              <each cell in {this.getCellsPerGroup(group)}>
                <ui-cell-tab cell={cell}
                  class={this.getCellTabClass()}
                  selected={this.onCellSelected}
                  focused={this.onCellFocused} />
              </each>
            </div>
          </div>
        </each>
      </div>
      <div class='cells'>
        <div class='cell-outputs'>
          <each cell in {this.state.cells}>
            <ui-cell-output
              cell={cell} />
          </each>
        </div>
      </div>
      <div class='command-input'>
        <vsplit-pane>
          <split-pane>
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
            <split-pane>
              <div if={this.state.runningCommand} class='runningCommand'>
                <i if={this.state.executeType === ExecuteCellTypes.parallel} class="material-icons">list</i>
                <i if={this.state.executeType === ExecuteCellTypes.serial} class="material-icons">sort</i>
              </div>
              <div if={this.state.runningCommand} class='runningCommand'>{this.state.runningCommand}</div>
              <button if={this.state.runningCommand} els='terminateBtn'
                onclick={this.onTerminateAll}>
                <i class="material-icons">block</i>
              </button>
            </split-pane>
          </split-pane>
          <split-pane>
            <span class='runningCommand'>
              <i if={this.executeToAllCellsType === ExecuteCellTypes.none} class="material-icons">keyboard_arrow_right</i>
              <i if={this.executeToAllCellsType === ExecuteCellTypes.parallel} class="material-icons">list</i>
              <i if={this.executeToAllCellsType === ExecuteCellTypes.serial} class="material-icons">sort</i>
            </span>
            <ui-command-input cid='input' els='cmdinput' enterValue={this.onExecute} />
          </split-pane>
        </vsplit-pane>
      </div>
    </vsplit-pane>
  </div>
</ui-devshell>
