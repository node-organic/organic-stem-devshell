<ui-cell-tab>
  <script>
    require('./index.css')
    require('els')(this)
    this.on('click', (e) => {
      if (this.state.data.selected) {
        if (e.target === this.els('selectedCheck')) {
          e.preventDefault()
          this.emit('selected', this.state.data)
        } else {
          this.emit('focused', this.state.data)
        }
      } else {
        this.emit('selected', this.state.data)
      }
    })
  </script>
  <div class=${this.state.data.focused ? 'focused' : ''}>
    <div class='checkbox'>
      <i class='material-icons' els='selectedCheck'>
        ${this.state.data.selected ? 'check_circle' : 'label'}
      </i>
    </div>
    <span>${this.state.data.name}</span>
  </div>
</ui-cell-tab>
