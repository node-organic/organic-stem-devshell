<ui-command-input>
  <script>
    require('./index.css')
    require('els')(this)
    this.on('keypress', (e) => {
      if (e.keyCode === 13) {
        this.emit('execute', this.els('input').value)
      }
    })
  </script>
  <virtual>
    <span><i class="material-icons">last_page</i></span>
    <input type='text' els='input' />
  </virtual>
</ui-command-input>
