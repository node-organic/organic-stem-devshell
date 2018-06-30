<ui-cell>
  <script>
    require('./index.css')
    this.state = {
      data: {
        selected: false
      }
    }
    this.on('click', () => {
      this.state.data.selected = !this.state.data.selected
      this.emit('selected', this.state.data)
      this.update()
    })
    this.on('updated', () => {
      if (this.state.data.selected) {
        this.className = 'selected'
      } else {
        this.className = ''
      }
    })
  </script>
  <div>
    <slot name='myText' />
  </div>
</ui-cell>
