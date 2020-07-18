<ui-devshell>
  <script>
    require('./devshell.css')

    require('./cell-group')
    require('./cell-tab')
    require('./cell-output')
    require('./command-input')
    require('./project-shell')

    const _ = require('lodash')
    const {
      ClientState,
      FetchClientState
    } = require('lib/chemicals')
    const {
      RequestScripts,
      Scripts
    } = require('lib/chemicals/project-shell')

    require('els')(this)

    const ExecuteCellTypes = require('./execute-cell-types')

    this.executeToAllCellsType = ExecuteCellTypes.none
    this.connectionError = false
    this.scripts = []
    this.projectShellFocused = false
    this.fetchingReleasedState = false

    require('./devshell-handlers').call(this)
    require('./devshell-methods').call(this)

    window.plasma.on(ClientState.type, (c) => {
      this.setState(c)
    })
    window.plasma.on(Scripts.type, (c) => {
      this.scripts = c.scripts
      this.update()
    })
    this.on('mounted', () => {
      window.plasma.emit(FetchClientState.create())
      window.plasma.emit(RequestScripts.create())
      require('./devshell-shortcut-keys.js').call(this)
    })
    
  </script>
  <div if={!this.state.cwd} class='wrapper'>
    <h1>Loading...</h1>
  </div>
  <div if={this.connectionError} class='wrapper'>
    <h1>Connection to server lost...</h1>
  </div>
  <div if={!this.connectionError && this.state.cwd} class='wrapper'>
    <div class='project'>
      <button class='projectShellBtn' onclick={this.toggleProjectShell}>
        <i class='material-icons projectShellBtnIcon'>donut_large</i>
      </button>
      <h1>{this.state.cwd.replace(this.state.userhome, '~')}</h1>
      <button if={!this.fetchingReleasedState} onclick={this.refreshReleasedState} class='releasedSyncBtn'>
        <i class='material-icons releasedSyncBtnIcon'>
          sync
        </i>
      </button>
    </div>
    <div class='projectShell'>
      <ui-project-shell prop-focused={this.projectShellFocused} />
      <div class='scripts'>
        <each script in {_.keys(this.scripts)}>
          <div class='script' onclick={this.onProjectScriptClick(script)}>
              {script}
          </div>
        </each>
      </div>
    </div>
    <vsplit-pane>
      <div class='groups virtualgroups'>
        <each group in {this.getCellVirtualGroups()}>
          <ui-cell-group key={group.name} group={group} onclick={this.onCellGroupSelected(group)} />
        </each>
      </div>
      <div class='groups'>
        <each group in {this.getCellGroups()}>
          <div>
            <ui-cell-group key={group.name} group={group} onclick={this.onCellGroupSelected(group)} />
            <div class='cell-tabs'>
              <each cell in {this.getCellsPerGroup(group)}>
                <ui-cell-tab cell={cell}
                  class={this.getCellTabClass()}
                  selected={this.onCellSelected}
                  focused={this.onCellFocused} />
              </each>
            </div>
          </div>
        </each>
      </div>
      <div class='cells'>
        <div class='cell-outputs'>
          <each cell in {this.state.cells}>
            <ui-cell-output
              cell={cell} />
          </each>
        </div>
      </div>
      <div class='command-input'>
        <vsplit-pane>
          <split-pane>
            <div if={this.executeToAllCellsType === ExecuteCellTypes.none} class='scripts cell'>
              <each script in {this.getFocusedCellScripts()}>
                <div class='cellscript' onclick={this.onCellScriptClick(script)}>{script}</div>
              </each>
            </div>
            <div if={this.executeToAllCellsType === ExecuteCellTypes.parallel} class='scripts common'>
              <each script in {this.getCommonCellScripts()}>
                <div class='cellscript' onclick={this.onCellScriptClick(script)}>
                    <i class='material-icons'>list</i>
                    {script}
                </div>
              </each>
            </div>
            <div if={this.executeToAllCellsType === ExecuteCellTypes.serial} class='scripts common'>
              <each script in {this.getCommonCellScripts()}>
                <div class='cellscript' onclick={this.onCellScriptClick(script)}>
                    <i class='material-icons'>sort</i>
                    {script}
                </div>
              </each>
            </div>
            <split-pane>
              <div if={this.state.runningCommand} class='runningCommand'>
                <i if={this.state.executeType === ExecuteCellTypes.parallel} class="material-icons">list</i>
                <i if={this.state.executeType === ExecuteCellTypes.serial} class="material-icons">sort</i>
              </div>
              <div if={this.state.runningCommand} class='runningCommand'>{this.state.runningCommand}</div>
              <button if={this.state.runningCommand} els='terminateBtn'
                onclick={this.onTerminateAll}>
                <i class="material-icons">block</i>
              </button>
            </split-pane>
          </split-pane>
          <split-pane>
            <span class='runningCommand'>
              <i if={this.executeToAllCellsType === ExecuteCellTypes.none} class="material-icons">keyboard_arrow_right</i>
              <i if={this.executeToAllCellsType === ExecuteCellTypes.parallel} class="material-icons">list</i>
              <i if={this.executeToAllCellsType === ExecuteCellTypes.serial} class="material-icons">sort</i>
            </span>
            <ui-command-input cid='input' els='cmdinput' enterValue={this.onExecute} />
          </split-pane>
        </vsplit-pane>
      </div>
    </vsplit-pane>
  </div>
</ui-devshell>
