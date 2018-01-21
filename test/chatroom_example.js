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

app.use(function(window, req, res, next) {
  if (!window.username) {
    if (!window.usernameRequested) {
      res.write('Enter username: ')
      window.usernameRequested = true
      return
    } else {
      if (req.buffer.toString('hex') == '0d') {
        window.username = window.newUsername
        chatHistory.push(window.username +' has joined the session.')
        users.push({window: window, res: res})
        req.buffer = ''
        update()
        return
      }
      if (!window.newUsername) {
        window.newUsername = ''
      }
      window.newUsername += req.buffer.toString('utf8')
      res.write('Enter username: ' + window.newUsername)
      return
    }
  } else {
    return next()
  }
})

app.use(function(window, req, res, next) {
  if (req.buffer.toString('utf8') == 'q') {
    res.write('goodbye '+ window.username + '\n')
    chatHistory.push(window.username +' has quit the session.')
    users = users.filter(user => user.window.username != window.username)
    update(window.username)
    res.exit(0)
    res.end()
    return
  }
  else if (req.buffer.toString('hex') == '0d') {
    chatHistory.push(window.username + ': ' + window.message)
    update(window.username)
    window.message = ''
  } else if (req.buffer.toString('hex') == '7f'){
    window.message = window.message.slice(0, -1)
  } else {
    if (req.buffer.toString('utf8') == 'undefined' || req.buffer == '') {
      window.message = ''
    } else {
      window.message += req.buffer.toString('utf8')
    }
  }

  // write out the chat history
  if (chatHistory.length > 0) {
    chatHistory.forEach(function(line) {
      res.sendLine('| '+line)
    })
  }

  if(!window.message) {
    window.message = ''
  }

  res.sendLine('|___________ ')
  res.sendLine('')
  res.sendLine(' ___________')
  res.sendLine('| Press "q" to exit.')
  res.sendLine('|-------------------')
  res.sendLine('| Send message: '+window.message)
  res.sendLine('|___________')
  next()
})

app.listen(2222, '', () => {
  console.log('listening on port 2222')
})
