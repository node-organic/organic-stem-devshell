<ui-command-input>
  <script>
    require('./index.css')
    require('els')(this)
    const _ = require('lodash')
    let commands_history = []
    let curHistoryIndex = null
    const UP = 38
    const DOWN = 40

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
        let cmd = this.els('input').value
        let foundIndex = commands_history.indexOf(cmd)
        if (foundIndex !== -1) commands_history.splice(foundIndex, 1)
        commands_history.push(cmd)
        commands_history = _.uniq(commands_history)
        curHistoryIndex = null
        this.emit('enterValue', cmd)
        this.els('input').value = ''
      }
      if (e.keyCode === UP) {
        if (curHistoryIndex === null) curHistoryIndex = commands_history.length - 1
        if (commands_history[curHistoryIndex]) {
          this.els('input').value = commands_history[curHistoryIndex]
          curHistoryIndex -= 1
        }
        if (curHistoryIndex < 0) curHistoryIndex = 0
      }
      if (e.keyCode === DOWN) {
        if (curHistoryIndex === null) return
        curHistoryIndex += 1
        if (commands_history[curHistoryIndex]) {
          this.els('input').value = commands_history[curHistoryIndex]
        }
        if (curHistoryIndex >= commands_history.length) {
          curHistoryIndex = null
          this.els('input').value = ''
        }
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
  <input type='text' els='input'
    onkeyup={this.onKeyUp}
    onkeydown={this.onKeyDown}
    />
</ui-command-input>
