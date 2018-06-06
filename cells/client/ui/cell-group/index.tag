<ui-cell-group>
  <script>
    require('./index.css')
    this.state = {
      data: {
        name: '',
        selected: false
      }
    }
    this.on('click', () => {
      this.state.data.selected = !this.state.data.selected
      this.emit('selected', this.state.data)
    })
    this.on('update', () => {
      if (this.state.data.selected) {
        this.className = 'selected'
      } else {
        this.className = ''
      }
    })
  </script>
  <span>${this.state.data.name}</span>
</ui-cell-group>
