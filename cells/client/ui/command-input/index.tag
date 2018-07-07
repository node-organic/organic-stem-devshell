<ui-command-input>
  <script>
    require('./index.css')
    require('els')(this)
    this.on('keyup', (e) => {
      if (e.keyCode === 13 && !e.shiftKey) {
        this.onExecuteToFocused()
      }
      if (e.keyCode === 13 && e.shiftKey) {
        this.onExecuteToAll()
      }
      this.update()
    })
    this.onExecuteToAll = () => {
      this.emit('executeToAll', this.els('input').value)
    }
    this.onExecuteToFocused = () => {
      this.emit('executeToFocused', this.els('input').value)
      this.els('input').value = this.getAttribute('value')
      this.state.value = this.getAttribute('value')
    }
    this.onTerminateAll = (e) => {
      this.emit('terminateAll')
    }
    this.getExecuteBtnsClassState = () => {
      if (!this.els('input')) return 'hidden'
      if (this.els('input').value !== this.getAttribute('value')) {
        return ''
      } else {
        return 'hidden'
      }
    }
    /* @WORKAROUND
       when doing re-render initiated by the parent component
       it sets `value` attribute to different value
       however rendering the component doesnt occurs because it
       already exists in the dom rendered previously by incremental-dom
       therefore we need to:
       1. buffer the passed `value` property
       2. forcebly set input's state to the new `value` property
    */
    this.on('updated', () => {
      if (this.mounted && this.state.value !== this.getAttribute('value')) {
        this.els('input').value = this.getAttribute('value')
      }
      this.state.value = this.getAttribute('value')
    })
  </script>
  <virtual>
    <span><i class="material-icons">last_page</i></span>
    <input type='text' els='input' value=${this.getAttribute("value")}/>
    <button tooltip='execute to all selected'
      class=${this.getExecuteBtnsClassState()} click=${this.onExecuteToAll}>
      <i class="material-icons">keyboard_arrow_right</i>
    </button>
    <button tooltip='execute'
      class=${this.getExecuteBtnsClassState()} click=${this.onExecuteToFocused}>
      <i class="material-icons">last_page</i>
    </button>
    <button if={this.getAttribute('value')} els='terminateBtn'
      click=${this.onTerminateAll}>
      <i class="material-icons">block</i>
    </button>
  </virtual>
</ui-command-input>
