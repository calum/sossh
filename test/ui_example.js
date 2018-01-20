var sossh = require('../src/sossh')
var fs = require('fs')
var path = require('path')

var options = {
  banner: 'Hello, World!\nClick any key to begin...',
  privateKey: fs.readFileSync(path.join(__dirname, 'keys')),
  publicKey: fs.readFileSync(path.join(__dirname, 'keys.pub')),
  logger: console.log
}

var app = sossh(options)

//app.use(sossh.utils.clear)
app.use(sossh.utils.arrowKeyParser)

// exit when 'q' is pressed
var exitOnQ = sossh.utils.exitOnKey
exitOnQ.setKey(71)
app.use(exitOnQ.exit)

var ui = sossh.utils.ui
ui.addOption("click me!", () => {
  console.log("user clicked option 1")
})
ui.addOption("don't click me!", () => {
  console.log("user clicked option 2")
})

app.use(ui.generate)

app.listen(2222, '', () => {
  console.log('listening on port 2222')
})
