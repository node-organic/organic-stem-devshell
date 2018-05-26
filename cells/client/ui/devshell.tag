<devshell class="container is-fluid">
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
    let project = null
    let groups = []
    let cells = []
    let selectedCellGroups = new Map()
    let selectedCells = new Map()
    let commands = []

    let terminateCmd = (cmd) => {
      // TODO
    }
    let terminateRunningCommands = () => {
      if (commands.length) {
        commands.forEach(terminateCmd)
      }
      commands = []
    }

    let onCellSelected = (cell) => {
      terminateRunningCommands()
      if (cell.selected) {
        selectedCells.set(cell.name, cell)
      } else {
        selectedCells.delete(cell.name)
      }
      this.update()
    }
    let onCellGroupSelected = (group) => {
      terminateRunningCommands()
      if (group.selected) {
        selectedCellGroups.set(group.name, group)
      } else {
        selectedCellGroups.delete(group.name)
      }
      cells.forEach(cell => {
        if (cell.groups.indexOf(group.name) === -1) return
        if (group.selected) {
          cell.selected = true
          selectedCells.set(cell.name, cell)
        } else {
          cell.selected = false
          selectedCells.delete(cell.name)
        }
      })
      this.update()
    }
    let execute = cmd => (e) => {
      terminateRunningCommands()
      commands = Array.from(selectedCells.values()).map((cell) => {
        return {
          cellName: cell.name,
          value: cmd
        }
      })
      this.update()
    }
    this.on('mount', () => {
      this.plasma.io.on('ProjectChemical', (c) => {
        project = c
        cells = project.cells
        groups = extractUniqueGroups(cells)
        this.update()
      })
      this.plasma.io.emit('fetch-project')
    })
  </script>
  <div if={project} class='wrapper'>
    <div class='project'>
      <h1>{project.cwd.replace(project.userhome, '~')}</h1>
    </div>
    <div class='groups'>
      <h2>Groups</h2>
      <each group in {groups}>
        <cell-group prop-data={group} prop-onselected={onCellGroupSelected}/>
      </each>
    </div>
    <div class='cells'>
      <h2>Cells</h2>
      <each cell in {cells}>
        <cell prop-data={cell} prop-onselected={onCellSelected}/>
      </each>
    </div>
    <command-input if={Array.from(selectedCells.values()).length > 0}
      prop-execute={execute} />
    <command-output if={commands.length > 0} prop-data={commands} />
  </div>
</devshell>
