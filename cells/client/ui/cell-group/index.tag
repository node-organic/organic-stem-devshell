<ui-cell-group>
  <script>
    require('./index.css')
    this.onClick = () => {
      this.emit('selected', this.props.group)
    }
  </script>
  <span class={this.props.group.selected ? 'selected': null} onclick={this.onClick}>{this.props.group.name}</span>
</ui-cell-group>
