<ui-xterm>
  <script>
    require('./index.css')
    require('xterm/css/xterm.css')
    require('client-lib/els')(this)
    const {FitAddon} = require('xterm-addon-fit')
    const {Terminal} = require('xterm')
    this.gainFocus = () => {
      this.xterm.focus()
    }
    this.clear = () => {
      this.xterm.clear()
    }
    this.on('mounted', () => {
      const xterm = new Terminal()
      xterm.attachCustomKeyEventHandler((e) => {
        if (e.ctrlKey && e.key === ' ') {
          return false // allow global ctrl+space
        }
        let isBrowserTabSwitcher = (e.ctrlKey || e.altKey) && e.keyCode >= 48 && e.keyCode <= 57
        if (isBrowserTabSwitcher) {
          return false
        }
      })
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
      setTimeout( () => {
        this.emit('ready', {
          cols: xterm.cols,
          rows: xterm.rows
        })
      }, 100)
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
