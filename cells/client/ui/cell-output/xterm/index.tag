<ui-xterm>
  <script>
    require('./index.css')
    require('xterm/dist/xterm.css')
    require('els')(this)
    const fit = require('xterm/dist/addons/fit/fit')
    const XTerm = require('xterm/dist/xterm')
    this.on('mounted', () => {
      setTimeout(() => {
        let container = this.els('container')
        let xterm = new XTerm({
          cols: 80,
          rows: 24
        })
        this.xterm = xterm
        xterm.open(container, false)
        xterm.fit()
        xterm.on('data', (c) => {
          this.emit('keypressed', c)
        })
        this.shouldRender = false
        this.emit('ready')
      }, 10)
    })
    this.write = function (chunk) {
      this.xterm.write(chunk)
    }
  </script>
  <div els='container' class='container' freeze></div>
</ui-xterm>
