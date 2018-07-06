<ui-command-input>
  <script>
    require('./index.css')
    require('els')(this)
    this.on('keypress', (e) => {
      if (e.keyCode === 13) {
        this.emit('execute', this.els('input').value)
      }
      if (this.els('input').value !== this.getAttribute('value')) {
        this.els('goBtn').classList.remove('hidden')
      } else {
        this.els('goBtn').classList.add('hidden')
      }
    })
    this.hasChanged = function () {
      if (!this.els('input')) return false // during first render input is not present
      return
    }
    this.onExecute = () => {
      this.emit('execute', this.els('input').value)
    }
    this.onTerminateAll = (e) => {
      this.emit('terminateAll')
    }
    this.on('updated', () => {
      this.els('input').value = this.getAttribute('value')
      this.els('goBtn').classList.add('hidden')
    })
  </script>
  <virtual>
    <span><i class="material-icons">last_page</i></span>
    <input type='text' els='input' value=${this.getAttribute("value")}/>
    <button els='goBtn' click=${this.onExecute}>
      <i class="material-icons">keyboard_arrow_right</i>
    </button>
    <button if={this.getAttribute('value')} els='terminateBtn'
      click=${this.onTerminateAll}>
      <i class="material-icons">block</i>
    </button>
  </virtual>
</ui-command-input>
