<ui-xterm>
  <script>
    require('./index.css')
    require('xterm/dist/xterm.css')
    require('els')(this)
    const XTerm = require('xterm/dist/xterm')
    this.on('mounted', () => {
      setTimeout(() => {
        let container = this.els('container')
        let xterm = new XTerm({
          cols: 20,
          rows: 24
        })
        this.xterm = xterm
        xterm.open(container, false)
        this.shouldRender = false
        this.emit('ready')
      }, 10)
    })
  </script>
  <div els='container' freeze></div>
</ui-xterm>
