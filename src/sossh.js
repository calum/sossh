var fs = require('fs')
var path = require('path')

var handle = require('./handle')
var sshServer = require('./ssh-server')
var utilities = require('./utilities')

var functionality = require('./functionality')

function init(options) {
  var privateKey = options.privateKey
  var publicKey = options.publicKey

  var app = handle()

  app.use(functionality.addFunctions)

  var server = sshServer.init(privateKey, publicKey, app, options)

  var sossh = {
    use: function(handle) {
      app.use(handle)
    },
    display: function(name, handle) {
      app.display(name, handle)
    },
    update: function(clients) {
      // forces an update to all sessions in clients array
      app.broadcast(clients)
    },
    listen: function(port, ips, callback) {
      this.server.listen(port, ips, callback)
    },
    server: server,
    app: app
  }

  return sossh
}

module.exports = init

module.exports.utils = utilities
