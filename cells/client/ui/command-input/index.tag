<ui-command-input>
  <script>
    require('./index.css')
    require('client-lib/els')(this)
    const {WatchKeys} = require('client-plasma/combokeys/chemicals')
    const _ = require('lodash')
    let commands_history = []
    let curHistoryIndex = null
    const UP = 38
    const DOWN = 40
    const SPACE = 32

    this.gainFocus = () => {
      this.els('input').focus()
      this.isTyping = true
    }
    this.looseFocus = () => {
      this.els('input').blur()
      this.isTyping = false
    }
    this.onKeyDown = (e) => {
      this.isTyping = true
      if (e.keyCode === SPACE && e.shiftKey) {
        e.preventDefault()
      }
    }
    this.onKeyUp = (e) => {
      if (e.keyCode === 13) {
        let cmd = this.els('input').value
        if (cmd !== '') {
          let foundIndex = commands_history.indexOf(cmd)
          if (foundIndex !== -1) commands_history.splice(foundIndex, 1)
          commands_history.push(cmd)
          commands_history = _.uniq(commands_history)
          curHistoryIndex = null
        }
        this.emit('enterValue', {cmd, ctrlKey: e.ctrlKey})
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
    this.onPaste = (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData('text')
      const cwd = this.props.cwd
      const focusedCell = this.props.focusedCell
      console.log(pasted, focusedCell.cwd)
      if (focusedCell && pasted.startsWith(focusedCell.cwd)) { 
        e.preventDefault()
        const value = pasted.replace(focusedCell.cwd + '/', '').replace(cwd, '')
        const inputField = this.els('input')
        if (inputField.selectionStart) {
          const startPos = inputField.selectionStart
          const endPos = inputField.selectionEnd
          inputField.value = inputField.value.substring(0, startPos) + value + 
            inputField.value.substring(endPos, inputField.value.length)
          inputField.selectionStart = startPos + value.length
          inputField.selectionEnd = startPos + value.length
        } else {
          inputField.value += value;
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
  <input type='text' els='input'
    onpaste={this.onPaste}
    onkeyup={this.onKeyUp}
    onkeydown={this.onKeyDown} />
</ui-command-input>
