const db = require('./db')
const urlencode = require('urlencode')
const jwt = require('jsonwebtoken')
const Web3 = require('web3')
const _ = require('underscore')
const io = require('socket.io')()
const hearts = 100000000

var chat = io
.of('/chat')
.on('connection', (socket) => {
  console.log('user connected.')

  socket.on('message', (from, channel, message) => {

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







/* Balancer */

const checkUserDeposits = (userId, userTxs, userAddress, balanceSocket) => {

  const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/225a510e91ff4a5ca736aa438cc7f4d6"))

  let ABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},
    {"indexed":true,"internalType":"address","name":"spender","type":"address"},
    {"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"data0","type":"uint256"},
    {"indexed":false,"internalType":"uint256","name":"data1","type":"uint256"},
    {"indexed":true,"internalType":"bytes20","name":"btcAddr","type":"bytes20"},
    {"indexed":true,"internalType":"address","name":"claimToAddr","type":"address"},
    {"indexed":true,"internalType":"address","name":"referrerAddr","type":"address"}],"name":"Claim","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"data0","type":"uint256"},
    {"indexed":false,"internalType":"uint256","name":"data1","type":"uint256"},
    {"indexed":false,"internalType":"uint256","name":"data2","type":"uint256"},
    {"indexed":true,"internalType":"address","name":"senderAddr","type":"address"}],"name":"ClaimAssist","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"data0","type":"uint256"},
    {"indexed":true,"internalType":"address","name":"updaterAddr","type":"address"}],"name":"DailyDataUpdate","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"data0","type":"uint256"},
    {"indexed":true,"internalType":"uint40","name":"stakeId","type":"uint40"}],"name":"ShareRateChange","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"data0","type":"uint256"},
    {"indexed":false,"internalType":"uint256","name":"data1","type":"uint256"},
    {"indexed":true,"internalType":"address","name":"stakerAddr","type":"address"},
    {"indexed":true,"internalType":"uint40","name":"stakeId","type":"uint40"}],"name":"StakeEnd","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"data0","type":"uint256"},
    {"indexed":false,"internalType":"uint256","name":"data1","type":"uint256"},
    {"indexed":true,"internalType":"address","name":"stakerAddr","type":"address"},
    {"indexed":true,"internalType":"uint40","name":"stakeId","type":"uint40"},
    {"indexed":true,"internalType":"address","name":"senderAddr","type":"address"}],"name":"StakeGoodAccounting","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"data0","type":"uint256"},
    {"indexed":true,"internalType":"address","name":"stakerAddr","type":"address"},
    {"indexed":true,"internalType":"uint40","name":"stakeId","type":"uint40"}],"name":"StakeStart","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},
    {"indexed":true,"internalType":"address","name":"to","type":"address"},
    {"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"data0","type":"uint256"},
    {"indexed":true,"internalType":"address","name":"memberAddr","type":"address"},
    {"indexed":true,"internalType":"uint256","name":"entryId","type":"uint256"},
    {"indexed":true,"internalType":"address","name":"referrerAddr","type":"address"}],"name":"XfLobbyEnter","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"data0","type":"uint256"},
    {"indexed":true,"internalType":"address","name":"memberAddr","type":"address"},
    {"indexed":true,"internalType":"uint256","name":"entryId","type":"uint256"},
    {"indexed":true,"internalType":"address","name":"referrerAddr","type":"address"}],"name":"XfLobbyExit","type":"event"},
    {"payable":true,"stateMutability":"payable","type":"fallback"},
    {"constant":true,"inputs":[],"name":"allocatedSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},
    {"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},
    {"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
    {"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":false,"inputs":[{"internalType":"uint256","name":"rawSatoshis","type":"uint256"},
    {"internalType":"bytes32[]","name":"proof","type":"bytes32[]"},
    {"internalType":"address","name":"claimToAddr","type":"address"},
    {"internalType":"bytes32","name":"pubKeyX","type":"bytes32"},
    {"internalType":"bytes32","name":"pubKeyY","type":"bytes32"},
    {"internalType":"uint8","name":"claimFlags","type":"uint8"},
    {"internalType":"uint8","name":"v","type":"uint8"},
    {"internalType":"bytes32","name":"r","type":"bytes32"},
    {"internalType":"bytes32","name":"s","type":"bytes32"},
    {"internalType":"uint256","name":"autoStakeDays","type":"uint256"},
    {"internalType":"address","name":"referrerAddr","type":"address"}],"name":"btcAddressClaim","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
    {"constant":true,"inputs":[{"internalType":"bytes20","name":"","type":"bytes20"}],"name":"btcAddressClaims","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[{"internalType":"bytes20","name":"btcAddr","type":"bytes20"},
    {"internalType":"uint256","name":"rawSatoshis","type":"uint256"},
    {"internalType":"bytes32[]","name":"proof","type":"bytes32[]"}],"name":"btcAddressIsClaimable","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[{"internalType":"bytes20","name":"btcAddr","type":"bytes20"},
    {"internalType":"uint256","name":"rawSatoshis","type":"uint256"},
    {"internalType":"bytes32[]","name":"proof","type":"bytes32[]"}],"name":"btcAddressIsValid","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},
    {"constant":true,"inputs":[{"internalType":"address","name":"claimToAddr","type":"address"},
    {"internalType":"bytes32","name":"claimParamHash","type":"bytes32"},
    {"internalType":"bytes32","name":"pubKeyX","type":"bytes32"},
    {"internalType":"bytes32","name":"pubKeyY","type":"bytes32"},
    {"internalType":"uint8","name":"claimFlags","type":"uint8"},
    {"internalType":"uint8","name":"v","type":"uint8"},
    {"internalType":"bytes32","name":"r","type":"bytes32"},
    {"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"claimMessageMatchesSignature","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},
    {"constant":true,"inputs":[],"name":"currentDay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"dailyData","outputs":[{"internalType":"uint72","name":"dayPayoutTotal","type":"uint72"},
    {"internalType":"uint72","name":"dayStakeSharesTotal","type":"uint72"},
    {"internalType":"uint56","name":"dayUnclaimedSatoshisTotal","type":"uint56"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[{"internalType":"uint256","name":"beginDay","type":"uint256"},
    {"internalType":"uint256","name":"endDay","type":"uint256"}],"name":"dailyDataRange","outputs":[{"internalType":"uint256[]","name":"list","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":false,"inputs":[{"internalType":"uint256","name":"beforeDay","type":"uint256"}],"name":"dailyDataUpdate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
    {"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},
    {"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
    {"constant":true,"inputs":[],"name":"globalInfo","outputs":[{"internalType":"uint256[13]","name":"","type":"uint256[13]"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[],"name":"globals","outputs":[{"internalType":"uint72","name":"lockedHeartsTotal","type":"uint72"},
    {"internalType":"uint72","name":"nextStakeSharesTotal","type":"uint72"},
    {"internalType":"uint40","name":"shareRate","type":"uint40"},
    {"internalType":"uint72","name":"stakePenaltyTotal","type":"uint72"},
    {"internalType":"uint16","name":"dailyDataCount","type":"uint16"},
    {"internalType":"uint72","name":"stakeSharesTotal","type":"uint72"},
    {"internalType":"uint40","name":"latestStakeId","type":"uint40"},
    {"internalType":"uint128","name":"claimStats","type":"uint128"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},
    {"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]


  let tokenAddress = '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39'
  let depositAddress = '0x4d3218B23D4f383dA54df6dDFf4833a9d36F75c3'
  
  let contract = new web3.eth.Contract(ABI, tokenAddress)

  web3.eth.getBlockNumber().then(latestBlock => {
    const startBlock = latestBlock - 1000000
    

    contract.getPastEvents(
      'Transfer',
      {
        filter: {
          from: userAddress,
          to: depositAddress
        },
        fromBlock: startBlock,
        toBlock: latestBlock
      },
      function(error, events) {
        //console.log('Transfer events: ', events)

        var unsaved = _.filter(events, function(event) {
            if (userTxs.length === 0) {
              return event
            } else {
              for (var i = 0; i < userTxs.length; i++) {
                if (userTxs[i].txhash !== event.transactionHash) {
                  return event
                }
              }

            }
        })

        //console.log('Unsaved Txs: ', unsaved)
        //console.log('Unsaved Txs value eg: ', unsaved[0].returnValues.value)

        unsaved.forEach(event => {
          db.Transaction.create({
            userId: userId,
            txhash: event.transactionHash,
            value: event.returnValues.value,
            status: 'pending'
          }).then(tx => {

            //console.log('Saved success!: ', tx)

          }).catch(function(err) {
            console.log(err)
          })
        })


        db.Transaction.findAll({
          where: {
            userId: userId
          }
        }).then(txs => {


          txs.forEach(tx => {
            //console.log('txhash: ', tx.txhash)
  
            if (tx.status === 'pending') {
              web3.eth.getTransactionReceipt(tx.txhash, function(err, success) {
                if (err) {
                  console.log('Failed to get transaction receipt', err)
                  return
                }
                  
                if (success !== null) {
  
                  var status = 'pending'
                  var tokenAmount = tx.value / hearts
                  if (success.status === true) {
  
                    console.log('Payment successful. Update user hex balance with following value: ', tokenAmount)
  
                    db.User.update({
                      hex_balance: db.sequelize.literal('hex_balance + ' + tokenAmount) 
                    }, {
                      where: {
                          id: userId
                      }
                    }).then(updatedUser => {

                      console.log('HERE\'S THE UPDATE USER', updatedUser)

                      db.User.findOne({
                        where: userId
                      }).then(theUser => {

                        console.log(theUser)
                        balanceSocket.emit('deposit', tokenAmount)
                        
                      }).catch(function(error) {
                        console.log('Error: ', error)
                      })


                    }).catch(function(error) {
                      console.log(error)
                    })
  
                    status = 'success'
                  } else if (success.status === false) {
  
                    status = 'failed'
                    console.log('Payment failed')
                  }
  
                  db.Transaction.update({
                    status: status
                  }, {
                    where: {
                      txhash: tx.txhash
                    }
                  }).then(updatedTx => {
                    console.log('UPDATED THE TRANSACTION HASH', updatedTx)
                  }).catch(function(error) {
                    console.log(error)
                  })
  
                } else {
                  console.log('No receipt yet', success)
                }
  
    
              })
            }
      
            
          })

          
        }).catch(function(err) {
          console.log(err)
        })



      }
    )
  })
}


const checkAllDeposits = (userId, balanceSocket) => {
  
  db.User.findOne({
    where: {
      id: userId
    },
    include: [db.Transaction]
  }).then(user => {

      if (user.hex_address === '0x0' || user.hex_address === null) {
        return
      }

      checkUserDeposits(user.id, user.transactions, user.hex_address, balanceSocket)

  })
}




var balance = io
.of('/balance')
.on('connection', (socket) => {
  socket.on('deposit', (token) => {
    console.log('Deposit: ', token)

    const user = jwt.verify(
      token, 
      'keyboardcat'
    )

    checkAllDeposits(user.id, balance)

    //balance.emit('deposit', 'check your eth bro')
  })




})



module.exports = {
  io,
  balance
}