# organic-stem-devshell

A tool to ease development of organic [distributed] systems.

![Screenshot](/screenshot.png?raw=true "organic-devshell")

## features & todo

- [x] automatically parse dna in cwd and present cells & cell groups
- [x] execute a command in parallel towards all selected cells
- [x] terminate a command previously executed towards all selected cells
- [x] running/not running status indicator
- [x] execute a command towards the focused cell
- [x] new output status indicator per cell
- [x] run commands towards the repo as well
- [x] execute a command sequentially towards all selected cells
- [x] shortcuts
  * `ctrl+space` - scrolls to bottom & focuses input
  * `ctrl+` || `shift+space` - switch to the terminal of a focused cell
  * `ctrl+alt+x` - toggles execution in parallel mode
  * `ctrl+alt+z` - toggles execution in sequential mode 
- [x] front commands - inputed via the command input
  * `s <term>` - selects all cells or cell groups including `term`
  * `ds` | `ds <term>` - deselects all cells or those including `term`
  * `f <term>` - focuses the first matching cell by `term`
  * `df` - blurs focused cell
  * `x` - terminates all commands running on focused cell
  * `r <number>` - runs a script from the currently visible ones by index number
  * `clear` - clears the focused cell output
- ? support non organic projects with minimum configuration
- ? all commands output combined in single output tab
- ? kill port/process tool
- ? browse dna tool
- ? os notification when cell terminated with error
- ? os notification when cell outputs to stderr

## develop

```
$ git clone 
$ cd organic-stem-devshell
$ npm install
$ npx angel repo cells -- npm install
$ npm run develop-sample
```

## use

```
cd /organic-monorepo-project-folder
npm i node-organic/organic-stem-devshell
npx devshell
```
