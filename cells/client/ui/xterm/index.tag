<ui-xterm>
  <script>
    require('./index.css')
    require('xterm/css/xterm.css')
    require('els')(this)
    const {FitAddon} = require('xterm-addon-fit')
    const {Terminal} = require('xterm')
    this.on('mounted', () => {
      let xterm = new Terminal()
      this.xterm = xterm
      xterm.loadAddon(fitAddon)
      xterm.open(this.els('container'), false)
      xterm.fit()
      // this.emit('xtermresize', {cols: xterm.cols, rows: xterm.rows})
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
