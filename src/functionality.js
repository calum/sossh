var fs = require('fs')

function addFunctions(window, stream, next) {
  var req = stream.request

  if (!req) {
    req = ''
  }

  if (!window.location) {
    window.location = '/'
  }

  stream.clean = function() {
    stream.request = ''
  }

  stream.sendLine = function(message) {
    stream.write(message)
    // start the next line
    stream.write('\x1b[1B')
    // go to the beginning of the line
    stream.write('\x1b['+window.cols+'D')
  }

  stream.sendFile = function(filename) {
    var file = fs.readFileSync(filename, 'utf8')
    file.split('\n').forEach(line => stream.sendLine(line))
  }

  stream.key = req.toString('utf8') || ''
  stream.string = req.toString('utf8') || ''
  stream.hex = req.toString('hex') || ''

  switch (stream.hex) {
    case '1b5b43':
      stream.key = 'right'
      break
    case '1b5b42':
      stream.key = 'down'
      break
    case '1b5b44':
      stream.key = 'left'
      break
    case '1b5b41':
      stream.key = 'up'
      break
    case '20':
      stream.key = 'spacebar'
      break
  }

  next(stream)
}

module.exports = {
  addFunctions: addFunctions
}
