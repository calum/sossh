var ssh2 = require('ssh2')
var utils = ssh2.utils

var crypto = require('crypto')
var inspect = require('util').inspect

function init(privateKey, publicKey, app, options) {
  var pub_key = utils.genPublicKey(utils.parseKey(publicKey))

  var banner = null
  var logger = (msg) => null

  if (options) {
    banner = options.banner
    if (options.logger)
      logger = options.logger
  }

  /**
  * create the ssh server
  **/
  var server = new ssh2.Server({
    hostKeys: [privateKey],
    banner: banner
  }, (client) => {

    client.on('authentication', (ctx) => {
      ctx.accept()
    })

    client.on('end', () => {
      logger('Client disconnected')
    })

    client.on('ready', () => {
      logger('Client connected')

      client.on('session', (accept, reject) => {
        var session = accept()

        session.window = {
          cols: 80,
          rows: 24
        }

        session.on('window-change', (accept, reject, info) => {
          session.window = {
            cols: info.cols,
            rows: info.rows
          }
          accept()
        })

        session.on('pty', (accept, reject, info) => {
          var session = accept()
          session.window = {
            cols: info.cols,
            rows: info.rows
          }
        })

        session.on('shell', (accept, reject) => {
          var stream = accept()

          stream.on('data', (chunk) => {
            stream.request = chunk
            app.handle(session.window, stream)
          })
        })
      })
    })
  })

  return server
}

module.exports = {
  init: init
}
