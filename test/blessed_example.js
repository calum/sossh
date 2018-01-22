var sossh = require('../src/sossh')
var path = require('path')
var blessed = require('blessed')
var fs = require('fs')

var options = {
  banner: 'Hello, World!\nClick any key to begin...',
  privateKey: fs.readFileSync(path.join(__dirname, 'keys')),
  publicKey: fs.readFileSync(path.join(__dirname, 'keys.pub'))
}

var app = sossh(options)

app.use(function(window, stream) {
  var stream

  var screen = blessed.screen({
    smartCSR: true,
    autoPadding: true
  })

  screen.title = 'SSH Chat Room'
  var box = blessed.box({
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    content: 'Hello {bold}world{/bold}!',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'magenta',
      border: {
        fg: '#f0f0f0'
      }
    }
  })

  screen.append(box)

  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0)
  })

  box.focus()

  screen.render()

})

app.listen(2222, '', () => {
  console.log('listening on port 2222')
})
