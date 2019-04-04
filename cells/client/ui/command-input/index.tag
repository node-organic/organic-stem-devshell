<ui-command-input>
  <script>
    require('./index.css')
    require('els')(this)
    window.plasma.emit({type: 'watchKeys', value: 'ctrl+space'}, () => {
      this.els('input').focus()
      this.isTyping = true
    })
    window.plasma.emit({type: 'watchKeys', value: 'escape', global: true}, () => {
      this.els('input').blur()
      this.isTyping = false
    })
    this.onKeyDown = (e) => {
      this.isTyping = true
    }
    this.onKeyUp = (e) => {
      if (e.keyCode === 13) {
        this.emit('enterValue', this.els('input').value)
        this.els('input').value = ''
      }
    }
    this.onTerminateAll = (e) => {
      this.emit('terminateAll')
    }
    this.on('updated', () => {
      if (this.isTyping) this.els('input').focus()
    })
  </script>
  <span if={this.props.runningCommand}><i class="material-icons">last_page</i></span>
  <div if={this.props.runningCommand} class='runningCommand'>{this.props.runningCommand}</div>
  <span if={!this.props.executeToAllCells}><i class="material-icons">keyboard_arrow_right</i></span>
  <span if={this.props.executeToAllCells}><i class="material-icons">last_page</i></span>
  <input type='text' els='input' onkeyup={this.onKeyUp} onkeydown={this.onKeyDown}/>
</ui-command-input>
