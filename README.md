# organic-stem-devshell

A tool to ease development of organic [distributed] systems.

## features & todo

- [x] automatically parse dna in cwd and present cells & cell groups
- [x] execute a command towards all selected cells
- [x] terminate a command previously executed towards all selected cells
- [x] running/not running status indicator
- [x] execute a command towards the focused cell
- [x] new output status indicator per cell
- ? all commands output combined in single output tab
- ? run commands towards the repo as well
- ? kill port/process tool
- ? browse dna tool
- ? os notification when cell terminated with error
- ? os notification when cell outputs to stderr

## develop

```
$ git clone 
$ cd organic-stem-devshell
$ npm install
```

## use

```
npm i node-organic/organic-stem-devshell
npx devshell
```
