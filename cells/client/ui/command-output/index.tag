<ui-command-output>
  <script>
    require('./index.css')
    require('els')(this)
    require('io-component')(this)

    const XTerm = require('xterm/dist/xterm')

    this.state.cells = []
    this.state.terminals = [{
      name: '$all-list$',
      allList: true
    }, /*{
      name: String,
      cellName: String
    }*/]
    this.state.selectedTerminal = this.state.terminals[0]
    this.state.terminals.contains = function (name) {
      for (let i = 0; i < this.length; i++) {
        if (this[i].name === name) return this[i]
      }
    }

    this.appendTextToSelectedTerminal = function (value) {
      let elName = 'buffer-' + this.state.selectedTerminal.name
      if (!this.els(elName)) throw new Error(elName + ' not found')
      let el = this.els(elName)
      el.xterm.writeln(value)
    }
    this.onIO('CommandOutput', (c) => {
      if (this.state.selectedTerminal.allList) {
        this.appendTextToSelectedTerminal(c.cellName + '$> ' + c.chunk)
      } else {
        this.appendTextToSelectedTerminal(c.chunk)
      }
    })
    this.onIO('CommandTerminated', (c) => {

    })

    this.initTerminalBuffer = function (term) {
      let el = this.els('buffer-' + term.name)
      if (!el) throw new Error('Element for Terminal buffer "' + 'buffer-' + term.name + '" not found in dom during xterm initialization')
      if (!el.xterm) {
        let term = new XTerm({
          cols: 80,
          rows: 24
        })
        el.xterm = term
        term.open(el, false)
      }
    }

    this.selectTerminal = (term) => {
      return (e) => {
        console.log('select', term)
        this.initTerminalBuffer(term)
        this.state.selectedTerminal = term
        this.update()
      }
    }

    this.on('update', () => {
      let visitedNames = ['$all-list$']
      this.state.cells.forEach((cell) => {
        if (!this.state.terminals.contains(cell.name)) {
          this.state.terminals.push({
            name: cell.name,
            cellName: cell.name
          })
          visitedNames.push(cell.name)
        } else {
          visitedNames.push(cell.name)
        }
      })
      for (let i = 0; i < this.state.terminals.length; i++) {
        let term = this.state.terminals[i]
        if (visitedNames.indexOf(term.name) === -1) {
          this.state.terminals.splice(i, 1)
          i -= 1
        }
      }
    })
    this.on('mounted', function () {
      // this.initTerminalBuffer(this.state.terminals[0])
    })
  </script>
  <virtual>
    <div class='tabs'>
      <each term in ${this.state.terminals}>
        <div class="commandOutputTab ${term.name === this.state.selectedTerminal.name ? 'selected' : ''}"
          click=${this.selectTerminal(term)}
          els=${'tab-' + term.name}>
          <virtual if=${term.cellName}>
            ${term.cellName}
          </virtual>
          <virtual if=${term.allList}>
            <i class="material-icons">list</i>
          </virtual>
        </div>
      </each>
    </div>
    <div class='outputBuffer'>
      <each term in ${this.state.terminals}>
        <div class='bufferTab' els=${'buffer-' + term.name}></div>
      </each>
    </div>
  </virtual>
</ui-command-output>
