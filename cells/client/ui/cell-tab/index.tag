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
    this.onClick = (e) => {
      this.state.hasOutput = false
      if (e.target === this.els('selectedCheck')) {
        e.preventDefault()
        e.stopPropagation()
        this.emit('selected', this.props.cell)
      } else {
        this.emit('focused', this.props.cell)
      }
    }
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
    })
  </script>
  <div class={"tab " + (this.props.cell.focused ? 'focused' : '')} onclick={this.onClick}>
    <div class={"checkbox " + this.getCheckboxClasses()}>
      <i class='material-icons' els='selectedCheck'>
        {this.props.cell.selected ? 'check_circle' : 'blur_circular'}
      </i>
    </div>
    <span class='cell-name'>{this.props.cell.name}</span>
  </div>
</ui-cell-tab>
