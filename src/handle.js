var handler = {
  use: function(handle) {
    handler.handles.push(handle)
  },
  broadcast: function(clients) {
    if (clients.length == 0) {
      return
    }
    clients.forEach(function(client) {
      //try {
        client.stream.request = null
        handler.handle(client.window, client.stream)
      //} catch (error) {
      //  throw new Error('You cannot write to an ended stream: '+error.message)
      //}
    })
  },

  handles: [],

  /**
  * The main handle for the ssh application.
  *
  * Takes in a window, request, and response.
  * Calls each of the handles in the handles array
  * one after the other until the last handle, or until
  * a handle does not call the callback
  *
  * @param window
  *     {rows, cols}
  * @param stream
  *     buffer object which represents a key press from the client
  **/
  handle: function(window, stream, index) {
    if (!index) {
      index = 0
    }

    if (index >= handler.handles.length) {
      return
    }

    // call the handle
    handler.handles[index](window, stream, function(new_stream) {
      if (!new_stream) {
        new_stream = stream
      }

      // call the next handle
      handler.handle(window, new_stream, index+1)
    })

  }
}

function handle() {
  return handler
}

module.exports = handle
