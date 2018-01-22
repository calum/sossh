/**
* This file holds some basic utilities
* for the sossh server
**/

/**
* Clears the terminal window
**/
function clear(window, stream, next) {
  // clear the terminal
  stream.write('\033[2J')
  stream.write('\033[0;0H')
  next()
}

/**
* Close the connextion when a key is pressed.
* @param key
*     The hex representation for that key
**/
var exitOnKey = {
  key: null,
  setKey: function(key) {
    exitOnKey.key = key
  },
  exit: function(window, stream, next) {
    if (stream.hex == exitOnKey.key) {
      stream.write('\033[2J')
      stream.exit(0)
      stream.end()
    } else {
      next()
    }
  }
}

/**
* Basic user interface
**/
var ui = {
  options: [],
  cursor: 0,
  addOption: function(name, onClick) {
    ui.options.push({
      name: name,
      callback: onClick,
      selected: false
    })
  },
  generate: function(window, stream, next) {
    stream.write('\033[0;0H')

    // read the input
    switch (stream.key) {
      case 'up':
        ui.cursor--
        if (ui.cursor < 0) {
          ui.cursor = 0
        }
        break
      case 'down':
        ui.cursor++
        if (ui.cursor > ui.options.length) {
          ui.cursor = ui.options.length
        }
        break
    }
    if (stream.hex == '20') {
      ui.options[ui.cursor].selected = !ui.options[ui.cursor].selected
      ui.options[ui.cursor].callback()
    }

    // print the user interface to the terminal
    stream.write('\x1b['+window.cols+'F')

    var spacing = Math.round((window.rows - ui.options.length)/2)

    // fill in the top of the screen
    for (var i=0; i<spacing; i++) {
      for (var j=0; j<window.cols; j++) {
        stream.write('\x1b[30;106m \x1b[0;0m')
      }
      stream.write('\x1b[1B') // start the next line
      // go to the beginning of the line
      stream.write('\x1b['+window.cols+'D')
    }

    // add the options
    for (var i=0; i<ui.options.length; i++) {
      var option = '[ ] '
      if (ui.options[i].selected) {
        option = '[+] '
      }

      var row = '\x1b[30;106m'+option+ui.options[i].name +'\x1b[0;0m'

      if (i == ui.cursor) {
        row = '\x1b[97;46m'+option+ui.options[i].name +'\x1b[0;0m'
      }

      stream.write('\x1b[30;106m   \x1b[0;0m')
      stream.write(row)

      for (var j=0; j<window.cols-ui.options[i].name.length-3-4; j++) {
        stream.write('\x1b[30;106m \x1b[0;0m')
      }

      stream.write('\x1b[1B') // start the next line
      // go to the beginning of the line
      stream.write('\x1b['+window.cols+'D')
    }

    // add the rest of the screen
    for (var i=0; i<window.rows-spacing-ui.options.length; i++) {
      for (var j=0; j<window.cols; j++) {
        stream.write('\x1b[30;106m \x1b[0;0m')
      }
      stream.write('\x1b[1B') // start the next line
      // go to the beginning of the line
      stream.write('\x1b['+window.cols+'D')
    }
    next()
  }

}

module.exports = {
  clear: clear,
  ui: ui,
  exitOnKey: exitOnKey
}
