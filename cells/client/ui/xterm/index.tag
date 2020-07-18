<ui-xterm>
  <script>
    require('./index.css')
    require('xterm/css/xterm.css')
    require('els')(this)
    const {FitAddon} = require('xterm-addon-fit')
    const {Terminal} = require('xterm')
    this.on('mounted', () => {
      const xterm = new Terminal()
      const fitAddon = new FitAddon()
      this.xterm = xterm
      xterm.loadAddon(fitAddon)
      xterm.open(this.els('container'), false)
      fitAddon.fit()
      this.emit('xtermresize', {cols: xterm.cols, rows: xterm.rows})
      xterm.onData((c) => {
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
