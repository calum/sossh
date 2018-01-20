var handler = {
  use: function(handle) {
    handler.handles.push(handle)
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
  * @param request
  *     buffer object which represents a key press from the client
  * @param response
  *     a writable stream which sends data to the client
  **/
  handle: function(window, request, response, index) {
    if (!index) {
      index = 0
    }

    if (index >= handler.handles.length) {
      return
    }

    // call the handle
    handler.handles[index](window, request, response, function(req) {
      if (!req) {
        var req = request
      }

      // call the next handle
      handler.handle(window, req, response, index+1)
    })

  }
}

function handle() {
  return handler
}

module.exports = handle
