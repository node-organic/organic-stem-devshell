<ui-cell-tab>
  <script>
    require('./index.css')
    require('els')(this)
    const {
      CommandStarted,
      CommandTerminated
    } = require('chemicals/terminals')
    this.on('click', (e) => {
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
        this.state.cell.commandRunning ? 'running': ''
      ].join(' ')
    }
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
