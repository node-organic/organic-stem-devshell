<ui-command-input>
  <script>
    require('./index.css')
    this.on('keypress', (e) => {
      if (e.keyCode === 13) {
        console.log('emit')
        this.emit('execute', this.refs.input.value)
      }
    })
    this.fnCall = (e) => {
      this.emit('execute', this.refs.input.value)
    }
  </script>
  <div>
    <input type='text' ref='input'/>
    <button class="mdl-button mdl-js-button mdl-button--raised"
      onclick={this.fnCall}>
      <i class="material-icons">face</i>[R]un
    </button>
  </div>
</ui-command-input>
