<ui-cell-group>
  <script>
    require('./index.css')
    this.on('click', () => {
      this.emit('selected', this.state.group)
    })
  </script>
  <span class=${this.state.group.selected ? 'selected': null}>${this.state.group.name}</span>
</ui-cell-group>
