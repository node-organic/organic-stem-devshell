<ui-command-output>
  <script>
    require('./index.css')
    window.plasma.io.on('CommandOutput', (c) => {
      console.log(c)
      this.refs['tabBuffer-$all-list'].innerHTML += c.chunk
      this.refs['tabBuffer-' + c.cellName].innerHTML += c.chunk
    })
    window.plasma.io.on('CommandTerminated', (c) => {
      console.log(c)
      this.refs['tabBuffer-$all-list'].innerHTML += 'Terminated: ' + c.cellName
      this.refs['tabBuffer-' + c.cellName].innerHTML += 'Terminated: ' + c.cellName
    })
    this.selectedTab = '$all-list'
    this.selectTab = (cellName) => {
      return (e) => {
        console.log('select', cellName)
        this.selectedTab = cellName
        this.update()
      }
    }
    this.on('updated', () => {
      for (let key in this.refs) {
        this.refs[key].classList.remove('selected')
      }
      this.refs['tabBtn-' + this.selectedTab].classList.add('selected')
      this.refs['tabBuffer-' + this.selectedTab].classList.add('selected')
    })
  </script>
  <virtual>
    <div class='tabs'>
      <div key='all' class="commandOutputTab" click=${this.selectTab('$all-list')}
        ref='tabBtn-$all-list' freeze>
        <i class="material-icons">list</i>
      </div>
      <each cmd, index in {this.state.cmds}>
        <div key=${index} class="commandOutputTab" click=${this.selectTab(cmd.cmdInfo.cellName)}
          ref=${'tabBtn-' + cmd.cmdInfo.cellName} freeze>
          ${cmd.cmdInfo.cellName}
        </div>
      </each>
    </div>
    <div class='outputBuffer'>
      <div key='all' class='bufferTab' ref='tabBuffer-$all-list' freeze>
        Combined output:
      </div>
      <each cmd, index in {this.state.cmds}>
        <div key=${index} class='bufferTab' ref=${'tabBuffer-' + cmd.cmdInfo.cellName} freeze></div>
      </each>
    </div>
  </virtual>
</ui-command-output>
