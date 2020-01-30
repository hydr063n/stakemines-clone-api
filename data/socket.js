const db = require('./db')
const urlencode = require('urlencode')
const jwt = require('jsonwebtoken')

var io = require('socket.io')()

var chat = io
.of('/chat')
.on('connection', (socket) => {

  socket.on('message', (from, channel, message) => {
    // store this message in the database
    console.log('from: ', from)
    console.log(`message from ${from} in ${channel}: ${message}`)

    const user = jwt.verify(
      from, 
      'keyboardcat'
    )

    db.Message.create({
      userId: user.id,
      channel: channel,
      text: urlencode(message)
    }).then(messageObject => {

      // emit to react ui
      var payload = {
        ...messageObject.dataValues, 
        username: user.username
      }

      chat.emit('message', payload)

    }).catch(error => {
      console.log('Failed to create the message', error)
      // how to send error to user who sent the message?
    })
  })

  socket.on('private-message', (from, to, channel, message) => {
    // store this message in the database
    console.log(`message from ${from} to ${to} in ${channel}: ${message}`);

    // send to the username chanenel
    //io.emit('chat message', `message in ${channel}: ${message}`);
  })
})


var gameLog = io
.of('/game-log')
.on('connection', (socket) => {
  // maybe only emit is needed here
  // and maybe the emit will be in the index router
  socket.on('log', (data) => {
    console.log('Game Log item: ', data)
  })
})


var balances = io
.of('/balances')
.on('connection', (socket) => {
  socket.on('deposit', (data) => {
    console.log('Deposit: ', data)
  })
})

module.exports = io