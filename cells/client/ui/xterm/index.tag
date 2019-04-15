<ui-xterm>
  <script>
    require('./index.css')
    require('xterm/dist/xterm.css')
    require('els')(this)
    const fit = require('xterm/dist/addons/fit/fit')
    const XTerm = require('xterm/dist/xterm')
    this.on('mounted', () => {
      let xterm = new XTerm({
        cols: 80,
        rows: 24
      })
      this.xterm = xterm
      xterm.open(this.els('container'), false)
      xterm.fit()
      xterm.on('data', (c) => {
        this.emit('keypressed', c)
      })
      this.shouldRender = false
      setTimeout( () => this.emit('ready') , 100)
    })
    this.write = function (chunk) {
      this.xterm.write(chunk)
    }
    this.scrollToBottom = function (chunk) {
      this.xterm.scrollToBottom()
    }
  </script>
  <div els='container' class='container'></div>
</ui-xterm>
