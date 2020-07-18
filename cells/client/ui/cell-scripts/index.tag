<cell-scripts not-global>
  <script>
    require('./index.css')
    require('./cellscript')
    const ExecuteCellTypes = require('../execute-cell-types')
    
    this.on('update', () => {
      this.devshell = this.props.devshell
      this.executeToAllCellsType = this.devshell.executeToAllCellsType
      switch (this.executeToAllCellsType) {
        case ExecuteCellTypes.none:
          this.cellscripts = this.devshell.getFocusedCellScripts()
          this.cellscriptsType = 'cell'
          this.icon = ''
          break
        case ExecuteCellTypes.parallel:
          this.cellscripts = this.devshell.getCommonCellScripts()
          this.cellscriptsType = 'common'
          this.icon = 'list'
          break
        case ExecuteCellTypes.serial:
          this.cellscripts = this.devshell.getCommonCellScripts()
          this.cellscriptsType = 'common'
          this.icon = 'sort'
          break
      }
    })
  </script>
  <div class={'scripts ' + this.cellscriptsType}>
    <each script, index in {this.cellscripts}>
      <cellscript 
        class='cellscript' 
        onclick={this.devshell.onCellScriptClick(script)}
        prop-index={index}
        prop-script={script}
        prop-icon={this.icon} />
    </each>
  </div>
</cell-scripts>