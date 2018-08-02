<ui-command-input>
  <script>
    require('./index.css')
    require('els')(this)
    window.plasma.combokeys.bind('ctrl+space', () => {
      this.els('input').focus()
    })
    this.onKeyUp = (e) => {
      if (e.keyCode === 13 && !e.shiftKey) {
        this.onExecuteToFocused()
      }
      if (e.keyCode === 13 && e.shiftKey) {
        this.onExecuteToAll()
      }
    }
    this.onExecuteToAll = () => {
      this.emit('executeToAll', this.els('input').value)
    }
    this.onExecuteToFocused = () => {
      this.emit('executeToFocused', this.els('input').value)
      this.update()
    }
    this.onTerminateAll = (e) => {
      this.emit('terminateAll')
    }
  </script>
  <span><i class="material-icons">last_page</i></span>
  <input type='text' els='input' onkeyup={this.onKeyUp} value={this.props.value}/>
  <button tooltip='execute to all selected' onclick={this.onExecuteToAll}>
    <i class="material-icons">keyboard_arrow_right</i>
  </button>
  <button tooltip='execute' onclick={this.onExecuteToFocused}>
    <i class="material-icons">last_page</i>
  </button>
  <button if={this.props.value} els='terminateBtn'
    onclick={this.onTerminateAll}>
    <i class="material-icons">block</i>
  </button>
</ui-command-input>
