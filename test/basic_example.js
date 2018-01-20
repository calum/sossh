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

app.use(function(window, req, res) {
  res.write('You pressed: ' + req.buffer.toString())
})

app.listen(2222, '', () => {
  console.log('listening on port 2222')
})
