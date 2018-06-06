<ui-devshell class="container is-fluid">
  <script>
    require('./cell-group')
    require('./cell')
    require('./command-input')
    require('./command-output')
    require('./devshell.css')
    const _ = require('lodash')

    let extractUniqueGroups = function (cells) {
      let names = _.uniq(_.flatten(cells.map(v => v.groups)))
      return names.map(name => {
        return {name: name}
      })
    }

    this.state.project = null
    this.state.groups = []
    this.state.cells = []
    this.state.selectedCellGroups = new Map()
    this.state.selectedCells = new Map()
    this.state.commands = []

    let terminateCmd = (cmd) => {
      window.plasma.io.emit('terminate-command', cmd.child.pid)
    }
    let terminateRunningCommands = () => {
      if (this.state.commands.length) {
        this.state.commands.forEach(terminateCmd)
      }
    }

    this.onCellSelected = (e) => {
      terminateRunningCommands()
      let cell = e.detail
      if (cell.selected) {
        this.state.selectedCells.set(cell.name, cell)
      } else {
        this.state.selectedCells.delete(cell.name)
      }
      this.update()
    }
    this.onCellGroupSelected = (e) => {
      terminateRunningCommands()
      let group = e.detail
      if (group.selected) {
        this.state.selectedCellGroups.set(group.name, group)
      } else {
        this.state.selectedCellGroups.delete(group.name)
      }
      this.state.cells.forEach(cell => {
        if (cell.groups.indexOf(group.name) === -1) return
        if (group.selected) {
          cell.selected = true
          this.state.selectedCells.set(cell.name, cell)
        } else {
          cell.selected = false
          this.state.selectedCells.delete(cell.name)
        }
      })
      this.update()
    }
    this.onExecute = (e) => {
      let cmd = e.detail
      terminateRunningCommands()
      let executeCommands = Array.from(this.state.selectedCells.values()).map((cell) => {
        return {
          cellName: cell.name,
          value: cmd
        }
      })
      window.plasma.io.emit('execute-commands', executeCommands, (err, results) => {
        if (err) return console.error(err)
        this.state.commands = results
        this.update()
      })
    }
    this.on('mounted', () => {
      window.plasma.io.on('ProjectChemical', (c) => {
        this.state.project = c
        this.state.cells = this.state.project.cells
        this.state.groups = extractUniqueGroups(this.state.cells)
        this.state.commands = this.state.project.runningCommands
        this.update()
      })
      window.plasma.io.emit('fetch-project')
    })
  </script>
  <virtual>
    <div if=${this.state.project} class='wrapper'>
      <div class='project'>
        <h1>${this.state.project.cwd.replace(this.state.project.userhome, '~')}</h1>
      </div>
      <div class='groups'>
        <h2>Groups</h2>
        <each group, index in {this.state.groups}>
          <ui-cell-group key=${index} data=${group} selected=${this.onCellGroupSelected}>
          </ui-cell-group>
        </each>
      </div>
      <div class='cells'>
        <h2>Cells</h2>
        <each cell, index in {this.state.cells}>
          <ui-cell key=${index} data=${cell} selected=${this.onCellSelected}>
            ${{'myText': this.html`<h3>${cell.name}</h3>`}}
          </ui-cell>
        </each>
      </div>
      <div class='command-input'>
        <ui-command-input if=${Array.from(this.state.selectedCells.values()).length > 0}
          execute=${this.onExecute} />
      </div>
      <div class='command-output'>
        <ui-command-output if=${this.state.commands.length > 0} cmds=${this.state.commands} />
      </div>
    </div>
  </virtual>
</ui-devshell>
