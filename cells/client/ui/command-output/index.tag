<command-output>
  <script>
    require('./index.css')
  </script>
  <div class='tabs'>
    <div class="selected commandOutputTab">
      <i class="material-icons">list</i>
    </div>
    <each cmd, index in {this.props.data}>
      <div class="commandOutputTab">
        {cmd.cellName}
      </div>
    </each>
  </div>
  <div class='outputBuffer'>
  </div>
</command-output>
