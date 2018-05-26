<cell-group>
  <script>
    require('./index.css')
    this.props.data.selected = false
    this.on('click', () => {
      this.props.data.selected = !this.props.data.selected
      this.props.onselected(this.props.data)
    })
    this.on('update', () => {
      if (this.props.data.selected) {
        this.root.className = 'selected'
      } else {
        this.root.className = ''
      }
    })
  </script>
  <name>{props.data.name}</name>
</cell-group>
