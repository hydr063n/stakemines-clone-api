var io = require('socket.io')()

io
.of('/chat')
.on('connection', (socket) => {

  socket.on('message', (channel, message) => {
    // store this message in the database
    console.log(`message in ${channel}: ${message}`);

    // send to react ui
    io.emit('chat message', `message in ${channel}: ${message}`);
  })

  socket.on('private-message', (channel, message) => {
    // store this message in the database
    console.log(`message in ${channel}: ${message}`);

    // send to the username chanenel
    //io.emit('chat message', `message in ${channel}: ${message}`);
  })


})


io
.of('/game-log')
.on('connection', (socket) => {

  // maybe only emit is needed here
  // and maybe the emit will be in the index router
  socket.on('log', (data) => {
    console.log('Game Log item: ', data)
  })
})


io
.of('/balances')
.on('connection', (socket) => {
  socket.on('deposit', (data) => {
    console.log('Deposit: ', data)
  })
})

module.exports = io