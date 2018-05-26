<command-input>
  <script>
    require('./index.css')
    this.on('keypress', (e) => {
      if (e.keyCode === 13) {
        this.props.execute(this.refs.input.value)(e)
      }
    })
    let fnCall = (e) => {
      this.props.execute(this.refs.input.value)(e)
    }
  </script>
  <input type='text' ref='input'/>
  <button class="mdl-button mdl-js-button mdl-button--raised"
    onclick={fnCall}>
    <i class="material-icons">face</i>[R]un
  </button>
</command-input>
