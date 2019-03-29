<ui-cell-tab>
  <script>
    require('./index.css')
    require('els')(this)
    const {
      CommandStarted,
      CommandTerminated,
      CommandOutput
    } = require('lib/chemicals/terminals')
    this.state.hasOutput = false
    this.getCheckboxClasses = () => {
      return [
        this.props.cell.selected ? 'selected': '',
        this.props.cell.commandRunning ? 'running': '',
        this.state.hasOutput && !this.props.cell.focused ? 'hasOutput' : ''
      ].join(' ')
    }
    this.on('mounted', () => {
      window.plasma.on(CommandOutput.byCell(this.props.cell), () => {
        this.state.hasOutput = true
        this.update()
      })
      this.shadowRoot.parentNode.onclick = (e) => {
        this.state.hasOutput = false
        if (e.target === this.els('selectedCheck')) {
          e.preventDefault()
          e.stopPropagation()
          this.emit('selected', this.props.cell)
        } else {
          this.emit('focused', this.props.cell)
        }
      }
    })
  </script>
  <div class={"tab " + (this.props.cell.focused ? 'focused' : '')}>
    <div class={"checkbox " + this.getCheckboxClasses()}>
      <i class='material-icons' els='selectedCheck'>
        {this.props.cell.selected ? 'check_circle' : 'panorama_fish_eye'}
      </i>
    </div>
    <span class='cell-name'>{this.props.cell.name}</span>
  </div>
</ui-cell-tab>
