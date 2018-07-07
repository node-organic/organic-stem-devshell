<ui-cell-tab>
  <script>
    require('./index.css')
    require('els')(this)
    const {
      CommandStarted,
      CommandTerminated,
      CommandOutput
    } = require('chemicals/terminals')
    this.state.hasOutput = false
    this.on('click', (e) => {
      this.state.hasOutput = false
      if (e.target === this.els('selectedCheck')) {
        e.preventDefault()
        e.stopPropagation()
        this.emit('selected', this.state.cell)
      } else {
        this.emit('focused', this.state.cell)
      }
    })
    this.getCheckboxClasses = () => {
      return [
        this.state.cell.selected ? 'selected': '',
        this.state.cell.commandRunning ? 'running': '',
        this.state.hasOutput && !this.state.cell.focused ? 'hasOutput' : ''
      ].join(' ')
    }
    this.on('mounted', () => {
      window.plasma.on(CommandOutput.byCell(this.state.cell), () => {
        this.state.hasOutput = true
        this.update()
      })
    })
  </script>
  <div class="tab ${this.state.cell.focused ? 'focused' : ''}">
    <div class='checkbox ${this.getCheckboxClasses()}'>
      <i class='material-icons' els='selectedCheck'>
        ${this.state.cell.selected ? 'check_circle' : 'blur_circular'}
      </i>
    </div>
    <span class='cell-name'>${this.state.cell.name}</span>
  </div>
</ui-cell-tab>
