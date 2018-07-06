<ui-cell-tab>
  <script>
    require('./index.css')
    require('els')(this)
    this.on('click', (e) => {
      if (e.target === this.els('selectedCheck')) {
        e.preventDefault()
        e.stopPropagation()
        this.emit('selected', this.state.cell)
      } else {
        this.emit('focused', this.state.cell)
      }
    })
  </script>
  <div class="tab ${this.state.cell.focused ? 'focused' : ''}">
    <div class='checkbox ${this.state.cell.selected ? 'selected': ''}'>
      <i class='material-icons' els='selectedCheck'>
        ${this.state.cell.selected ? 'check_circle' : 'blur_circular'}
      </i>
    </div>
    <span class='cell-name'>${this.state.cell.name}</span>
  </div>
</ui-cell-tab>
