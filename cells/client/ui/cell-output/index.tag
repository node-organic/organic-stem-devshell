<ui-cell-output>
  <script>
    require('./index.css')
    require('./xterm')
    require('els')(this)
    this.xtermReady = () => {
      setTimeout(() => {
        this.hide()
      }, 100)
    }
    this.show = function () {
      this.els('xterm').classList.remove('hidden')
    }
    this.hide = function () {
      this.els('xterm').classList.add('hidden')
    }
    this.on('updated', () => {
      if (!this.mounted) return
      if (this.state.data.focused) {
        this.show()
      } else {
        this.hide()
      }
    })
  </script>
  <ui-xterm els='xterm' ready=${this.xtermReady} />
</ui-cell-output>
