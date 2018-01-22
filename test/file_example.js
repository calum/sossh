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

app.use(sossh.utils.clear)

app.use((window, req, res) => {
  res.sendFile(path.join(__dirname, 'assets/testFile.txt'))
})

app.listen(2222, '', () => {
  console.log('listening on port 2222')
})
