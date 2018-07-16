<ui-cell-group>
  <script>
    require('./index.css')
  </script>
  <span class={this.props.group.selected ? 'selected': null}>{this.props.group.name}</span>
</ui-cell-group>
