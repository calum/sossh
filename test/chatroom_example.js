var sossh = require('../src/sossh')
var fs = require('fs')
var path = require('path')

var options = {
  banner: 'Hello! Welcome to the SSH chat room!\nYou can leave at any time by pressing "q".\nPress "Enter" to start...',
  privateKey: fs.readFileSync(path.join(__dirname, 'keys')),
  publicKey: fs.readFileSync(path.join(__dirname, 'keys.pub')),
}

var app = sossh(options)

var chatHistory = []
var users = []

function update(username) {
  var users_to_update = users.filter(user => user.window.username != username)
  console.log(chatHistory)
  app.update(users_to_update)
}

app.use(sossh.utils.clear)

app.use(function(window, stream, next) {
  if (!window.username) {
    if (!window.usernameRequested) {
      stream.write('Enter username: ')
      window.usernameRequested = true
      return
    } else {
      if (stream.hex == '0d') {
        window.username = window.newUsername
        chatHistory.push(window.username +' has joined the session.')
        users.push({window: window, stream: stream})
        stream.request = ''
        update()
        return
      }
      if (!window.newUsername) {
        window.newUsername = ''
      }
      window.newUsername += stream.string
      stream.write('Enter username: ' + window.newUsername)
      return
    }
  } else {
    return next()
  }
})

app.use(function(window, stream, next) {
  console.log(stream.string)
  if (stream.string == 'q') {
    stream.write('goodbye '+ window.username + '\n')
    chatHistory.push(window.username +' has quit the session.')
    users = users.filter(user => user.window.username != window.username)
    update(window.username)
    stream.exit(0)
    stream.end()
    return
  }
  else if (stream.hex == '0d') {
    chatHistory.push(window.username + ': ' + window.message)
    update(window.username)
    window.message = ''
  } else if (stream.hex == '7f'){
    window.message = window.message.slice(0, -1)
  } else if (stream.key == 'up' || stream.key == 'down') {
    // do nothing
  } else {
    if (stream.string == 'undefined' || stream.string == '') {
      window.message = ''
    } else {
      window.message += stream.string
    }
  }

  if (!window.line) {
    window.line = 0
  }

  if (stream.key == 'up') {
    window.line++
  } else if (stream.key == 'down') {
    window.line--
    if (window.line < 0) {
      window.line = 0
    }
  }

  // write out the chat history
  var lines = []

  if (chatHistory.length > 0) {
    chatHistory.forEach(function(line) {
      lines.push('| '+line)
    })
  }

  if(!window.message) {
    window.message = ''
  }

  // print out the window.rows number of lines
  var start_line = lines.length - (window.rows - 7) - window.line
  if (start_line < 0) {
    start_line = 0
  }
  var end_line = start_line + window.rows - 7
  if (end_line > lines.length) {
    end_line = lines.length
  }
  for (var i=start_line; i<end_line; i++) {
    stream.sendLine(lines[i])
  }

  stream.sendLine('|___________ ')
  stream.sendLine('')
  stream.sendLine(' ___________')
  stream.sendLine('| Press "q" to exit.')
  stream.sendLine('|-------------------')
  stream.sendLine('| Send message: '+window.message)
  stream.sendLine('|___________')

  next()
})

app.listen(2222, '', () => {
  console.log('listening on port 2222')
})
