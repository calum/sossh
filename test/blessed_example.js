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

app.use(function(window, stream, next) {
  console.log(stream.string)
  if (window.location != '/') {
    next(stream)
  }

  window.location = '/user-input'

  stream.rows = window.rows
  stream.columns = window.cols

  var screen = blessed.screen({
    smartCSR: true,
    autoPadding: true,
    input: stream,
    output: stream,
    terminal: window.terminal || 'ansi'
  })

  screen.title = 'SSH Chat Room'

  var form = blessed.form({
    parent: screen,
    keys: true,
    left: 0,
    top: 0,
    width: 50,
    height: 10,
    bg: 'green',
    content: 'Enter a display name'
  })

  var text_area = blessed.textbox({
    parent: form,
    keys: true,
    inputOnFocus: true,
    padding: {
      left: 1,
      right: 1
    },
    left: 10,
    top: 4,
    shrink: true,
    style: {
      bg: 'blue',
      focus: {
        bg: 'red'
      }
    }
  })

  var submit = blessed.button({
    parent: form,
    keys: true,
    shrink: true,
    padding: {
      left: 1,
      right: 1
    },
    left: 30,
    top: 8,
    shrink: true,
    name: 'submit',
    content: 'submit',
    style: {
      bg: 'blue',
      focus: {
        bg: 'red'
      },
      hover: {
        bg: 'red'
      }
    }
  })

  submit.on('press', function() {
    form.submit()
  })

  form.on('submit', function(data) {
    console.log(data)
    window.username = data.textbox
    window.location = '/chat-room'
    screen.destroy()
    next()
  })

  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0)
  })

  screen.render()

})

app.use(function(window, stream, next) {
  console.log(stream.string)
  if (window.location != '/chat-room') {
    next(stream)
  }

  stream.rows = window.rows
  stream.columns = window.cols

  var screen = blessed.screen({
    smartCSR: true,
    autoPadding: true,
    input: stream,
    output: stream,
    terminal: window.terminal || 'ansi'
  })

  screen.title = 'SSH Chat Room'

  var box = blessed.box({
    top: 'center',
    left: 'center',
    width: '75%',
    height: '75%',
    content: 'Hello {bold}'+window.username+'{/bold}!',
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

  box.key('enter', function(ch, key) {
    box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
    box.setLine(1, 'bar');
    box.insertLine(1, 'foo');
    screen.render();
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
