var express = require('express')
var jwt = require('jsonwebtoken')
var Cookies = require('universal-cookie')
var bcrypt = require('bcrypt')
var math = require('mathjs')
var db = require('../data/db.js')
var router = express.Router()
var urlencode = require('urlencode')
var Web3 = require('web3')
var _ = require('underscore')

const hearts = 100000000

router.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3002')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.all('/getMessage', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3002')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.all('/user/login', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3002')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.all('/user/register', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3002')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})


router.all('/minesweeper', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3002')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.all('/getGameLog', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3002')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.get('/', function(req, res, next) {
  db.Message
  .findAll({
    include: db.User
  })
  .then((messages) => {

    //console.log(messages)

    res.set('Content-Type', 'application/json');
    res.send(messages)

  }).catch((error) => {
    console.log(error)
  })
})

router.post('/getMessage', function(req, res, next) {
  //console.log('DATA')
  //console.log(req.body)

  const message = req.body.payload.message
  const user = req.body.payload.user

  console.log('USER: ', user)
  console.log('MESSAGE: ', message)

  const data = jwt.verify(user.token, 'keyboardcat')

  db.Message.create({
    userId: data.id,
    text: urlencode(message)
  }).then(message => {
    console.log('Message created successfully', message)
    res.send('Success')
  }).catch(error => {
    console.log('Failed to create the message')
    res.send('Error')
  })
})

router.post('/user/register', function(req, res, next) {

  const payload = req.body.payload

  db.User.findOne({
    where: {
      email: payload.email
    }
  }).then(user =>{
    if (user) {
      console.log('This email has already been used')
      res.status(500).send('This email has already been used')
    } else {
      db.User.findOne({
        where: {
          email: payload.username
        }
      }).then(nuser =>{
        if (nuser) {
          console.log('This username has already been used!')
          res.status(500).send('This username has already been used!')
        } else {

          

          db.User.create(
            {
              username: payload.username,
              email: payload.email,
              password: payload.password,
              lol_address: '0x0',
              hex_address: payload.hex_address
            }
          ).then(newUser => {

            console.log('You have successfully registered!')
            console.log(newUser)

            var token = jwt.sign(
              {
                id: newUser.id,
                username: newUser.username,
                image: newUser.image,
                hex_address: newUser.hex_address,
                hex_balance: newUser.hex_balance,
              }, 
              'keyboardcat', 
              {
                expiresIn: 86400 // expires in 24 hours
              }
            )

            var response = {
              token: token,
              isLoggedIn: true
            }

            res.status(200).send(response)

          }).catch(function(err) {
            console.log(err)
            console.log('Failed to run sql query')
          })
        }
      }).catch(function(err) {
        console.log(err)
        console.log('Failed to do the sql query')
      })
    }
  }).catch(function(err) {
    console.log(err)
    console.log('Failed to do sql query')
  })
})


router.post('/user/login', function(req, res, next) {
  const payload = req.body.payload

  db.User.findOne({
    where: {
      email: payload.username,
      password: payload.password
    }
  }).then(user => {
    if (user) {

      var token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          image: user.image,
          hex_address: user.hex_address,
          hex_balance: user.hex_balance
        }, 
        'keyboardcat', 
        { expiresIn: 86400 } // expires in 24 hours
      )

      req.session.token = token

      var response = {
        isLoggedIn: true,
        token: token
      }

      console.log(response)
      res.send(response)

    } else {
      console.log('Unable to find the email')

      db.User.findOne({
        where: {
          username: payload.username,
          password: payload.password
        }
      }).then(nuser => {
        if (nuser) {
          console.log('You have logged in with username!', nuser)

          var token = jwt.sign(
            {
              id: nuser.id,
              username: nuser.username,
              id: nuser.id,
              image: nuser.image,
              hex_address: nuser.hex_address,
              hex_balance: nuser.hex_balance
            }, 
            'keyboardcat',
            {
              expiresIn: 86400 // expires in 24 hours
            }
          )
          
          req.session.token = token

          var response = {
            isLoggedIn: true,
            token: token
          }

          console.log(response)
          res.send(response)
        } else {
          var msg = 'Incorrect username or password!'
          console.log(msg)
          res.send(msg)
        }
      }).catch(function(err) {
        console.log(err)
        console.log('Failed to do the sql query')
      })

    }
  }).catch((err) => {
    console.log(err)
    console.log('Failed to do sql query')
  })
})

router.get('/user/:key', function(req, res, next) {
  const cookies = new Cookies(req.headers.cookie)
  console.log(cookies.get('id'))

  db.User.findOne({
    where: {
      id: req.params.key,
    }
  }).then(user =>{
    if (user) {
      console.log(user)
      res.send(user)
    } else {
      console.log('User not found')
    }

  }).catch(function(err) {
    console.log(err)
    console.log('Failed to run sql query')
  })
})

router.post('/testToken', function(req, res, next) {
  const payload = req.body.payload
  console.log(payload)

  const data = jwt.verify(payload, 'keyboardcat')
  console.log(data)
})

router.post('/getGameLog', function(req, res, next) {
  const payload = req.body.payload
  //console.log(payload)

  db.Log.findAll({
    limit: 10,
    include: [ db.User ],
    order: [
      ['createdAt', 'DESC']
    ]
  })
  .then(logs => {
    res.status(200).send(logs)
  })
  .catch(error => {
    console.log(error)
    res.status(500).send(error)
  })
})

router.post('/minesweeper', function(req, res, next) {
  const payload = req.body.payload

  const minesweeper = payload.minesweeper
  const token = payload.token

  const data = jwt.verify(token, 'keyboardcat')

  const controller = minesweeper.controller
  const game = minesweeper.game

  //check the data for win or loss
  const nCr = (n, r) => (
    math.factorial(n) / math.factorial(r) / math.factorial(n - r)
  )

  const calculateMultiplier = (mines, diamonds) => (
    //house_edge = 0.01
    (1 - 0.01) * nCr(25, diamonds) / nCr(25 - mines, diamonds)
  )

  console.log('Starting off calculation')

  
  mines = game.mines
  diamonds = game.selectedBlocks

  mines = game.mines
  diamonds = game.selectedBlocks

  var detonatedBomb = false
  for (var i = 0; i < diamonds.length; i++) {
    for (var j = 0; j < mines.length; j++) {
      if (diamonds[i] === mines[j]) {
        detonatedBomb = true
        break
      }
    }
  }

  multiplier = calculateMultiplier(mines.length, diamonds.length)
  var outcome = {}
  var betAmount = parseFloat(controller.betAmount)

  if (detonatedBomb) {
    outcome = {
      payout: multiplier * -1,
      profit: betAmount * multiplier * -1
    }
  } else {
    outcome = {
      payout: multiplier,
      profit: betAmount * multiplier
    }
  }

  db.Log.create({
    userId: data.id,
    payout: outcome.payout,
    profit: outcome.profit
  }).then(log => {
    console.log(log)
    res.status(200).send(log)
  }).catch(error => {
    console.log(error)
    res.status(500).send(error)
  })
})

const checkUserDeposits = (userId, userTxs, userAddress) => {

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

        console.log('Unsaved Txs: ', unsaved)
        //console.log('Unsaved Txs value eg: ', unsaved[0].returnValues.value)

        unsaved.forEach(event => {
          db.Transaction.create({
            userId: userId,
            txhash: event.transactionHash,
            value: event.returnValues.value,
            status: 'pending'
          }).then(tx => {

            console.log('Saved success!: ', tx)

          }).catch(function(err) {
            console.log(err)
          })
        })


        db.Transaction.findAll({
          where: {
            userId: userId
          }
        }).then(txs => {

          //console.log('FRESH TXS: ', txs)

          txs.forEach(tx => {
            console.log('txhash: ', tx.txhash)
  
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
                      console.log(updatedUser)
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
                    console.log(updatedTx)
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
    
        /*events.forEach(event => {
          console.log(event.blockHash)


          console.log('Check block hash in the db')
    
          web3.eth.getTransactionReceipt(event.transactionHash, function(err, success) {
            if (err) {
              console.log('Failed to get transaction receipt', err)
              return
            }
              
            if (success !== null) {
              if (success.status === true) {
                console.log('Payment successful')
              } else if (success.status === false) {
                console.log('Payment failed')
              }
            } else {
              console.log('No receipt yet')
            }

          })
        })*/







      }
    )
  })
}


const checkAllDeposits = () => {

  db.User.findAll({
    include: [db.Transaction]
  }).then(users => {
    users.forEach(user => {

      if (user.hex_address === '0x0' || user.hex_address === null) {
        return
      }

      //console.log('USER: ', user)
      //console.log('TRANSACTIONS: ', user.transactions)

      checkUserDeposits(user.id, user.transactions, user.hex_address)
    })
  })
}

checkAllDeposits()

//setInterval(checkAllDeposits, 60000)

module.exports = router
