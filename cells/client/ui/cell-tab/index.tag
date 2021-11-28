<ui-cell-tab>
  <script>
    require('./index.css')
    require('client-lib/els')(this)
    const {
      CommandStarted,
      CommandTerminated,
      CommandOutput
    } = require('lib/chemicals/terminals')
    this.hasOutput = false
    this.getCheckboxClasses = () => {
      return [
        this.props.cell.selected ? 'selected': '',
        this.props.cell.commandRunning ? 'running': '',
        this.hasOutput && !this.props.cell.focused ? 'hasOutput' : ''
      ].join(' ')
    }
    this.on('mounted', () => {
      window.plasma.on(CommandOutput.byCell(this.props.cell), () => {
        this.hasOutput = true
        this.update()
      })
      this.el.onclick = (e) => {
        this.hasOutput = false
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
  <div class={"tab " + (this.props.cell.focused ? 'focused' : 'blured')}>
    <div class={"checkbox " + this.getCheckboxClasses()}>
      <i class='material-icons' els='selectedCheck'>
        {this.props.cell.selected ? 'check_circle' : 'panorama_fish_eye'}
      </i>
    </div>
    <span class='cell-name'>{this.props.cell.name}</span>
    <i if={this.props.cell.released !== undefined} class='material-icons releasedStatus'>
      {this.props.cell.released ? 'done' : 'cloud_upload'}
    </i>
  </div>
</ui-cell-tab>
