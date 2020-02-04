const express = require('express')
const jwt = require('jsonwebtoken')
const Cookies = require('universal-cookie')
const bcrypt = require('bcrypt')
const math = require('mathjs')
const db = require('../data/db')
const { balance } = require('../data/socket')
const router = express.Router()
const urlencode = require('urlencode')
const Web3 = require('web3')
const _ = require('underscore')
const sha1 = require('js-sha1')



router.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3001')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.all('/getMessage', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3001')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.all('/user/login', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3001')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.all('/user/register', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3001')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})


router.all('/minesweeper/bet', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3001')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.all('/minesweeper/cashout', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3001')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.all('/getGameLog', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3001')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.get('/', function(req, res, next) {
  db.Message
  .findAll({
    include: db.User,
    limit: 10
  })
  .then((messages) => {

    //console.log(messages)

    res.set('Content-Type', 'application/json');
    let returnMessages = []
    messages.forEach(message => {
      let msg = { ...message.dataValues }
      msg.username = msg.user.username
      msg.user = null

      //console.log(msg)

      returnMessages.push(msg)
    })

    res.send(returnMessages)

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

          let referralCode = sha1(payload.username)
          console.log('referral code', referralCode)

          db.User.create(
            {
              username: payload.username,
              email: payload.email,
              password: payload.password,
              lol_address: '0x0',
              hex_address: payload.hex_address,
              referralCode: referralCode.substring(0,7)
            }
          ).then(newUser => {

            console.log('You have successfully registered!', newUser.dataValues.id)
            console.log('Referral Payload: ', payload.referralCode)

            let referralNotice = ''
            if (payload.referralCode !== null) {
              // create referral item
              db.User.findOne({
                where: {
                  referralCode: payload.referralCode
                }
              }).then(referralUser => {


                if (referralUser) {
                  console.log('Referral created successfully')
  
                  db.Referral.create({
                    userId: referralUser.dataValues.id,
                    referralUserId: newUser.dataValues.id
                  }).then(referralItem => {
                    console.log('Referral Created', referralItem)

                      // update user balance
                      db.User.update({
                        hex_balance: db.sequelize.literal('hex_balance + 5000')
                      }, {
                        where: {
                          id: referralUser.id
                        }
                      }).then(status => {
                        console.log('User balance updated successfully', status)
                      }).catch(function(err) {

                        console.log('Failed to update the user.', referralItem)


                      })

                  }).catch(function(err) {
  
                    console.log('Failed to create referall item.', referralItem)
  
                  })

                } else {
                  console.log('Couldn\'t find any user with that referralCode')
                }

              })

              

             

            }
            

            var token = jwt.sign(
              newUser.dataValues, 
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
        user, 
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
            nuser.dataValues, 
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



getMineLocations = (mines) => {            
  const squareSize = 5
  const bombCount = parseInt(mines)

  var defaultCoordinates = {x: -1, y: -1}
  var mines = []
  var mineData = []

  for (var i = 0; i < bombCount; i++) {
      mines.push({x: -1, y: -1})
  }

  for(var i = 0; i < bombCount; i) {

      const coordinates = {
          x: Math.floor(Math.random() * squareSize),
          y: Math.floor(Math.random() * squareSize)
      }

      var skip = false
      for (var j = 0; j < bombCount; j++) {
          if (mines[j].x === coordinates.x && mines[j].y === coordinates.y) {
              skip = true
              break
          }
      }
      
      if (!skip) {
          mines[i].x = coordinates.x
          mines[i].y = coordinates.y

          const location = squareSize * coordinates.y + coordinates.x 

          mineData.push(location.toString())
          i++
      }
  }

  return mineData
}


router.post('/minesweeper/bet', function(req, res, next) {
  const payload = req.body.payload

  const user = jwt.verify(
    payload.token, 
    'keyboardcat'
  )


  if (payload.type === 'cashout') {

    console.log('Cashout dude')


    db.Log.update({
      status: 'win'
    }, {
      where: {
        id: payload.gameId
      }
    }).then(newLog => {

      console.log('Game successfully updated. You can pay the user now: ', newLog)

    }).catch(function(error) {

      console.log('Failed to update the game: ', error)

    })

    //let winValue = payload.b
    let betAmount = parseFloat(payload.betAmount)
    console.log('BET AMOUNT: ', betAmount)
    console.log('PAYOUT AMOUNT: ', payload.payout)

    let winAmount = betAmount * payload.payout

    console.log('win AMOUNT: ', winAmount)
    
    db.User.update({
      hex_balance: db.sequelize.literal(`hex_balance + ${winAmount}`)
    }, {
      where: {
        id: user.id
      }
    }).then(updatedUser => {

      console.log('The user was successfully updated: ', updatedUser)
      balance.emit('winAmount', winAmount)

    }).catch(function(error) {

      console.log('Failed to update the user: ', error)

    })

    let returnPayload = {
      id: payload.gameId,
      type: 'EXISTING_GAME',
      blockValue: blockValue,
      status: 'win',
      betAmount: payload.betAmount,
      selectedBlocks: payload.selectedBlocks,
      payout: payload.payout,
      winAmount: winAmount,
    }

    res.status(200).send(returnPayload)


  } else {

    if (payload.gameId === -1) {

      let mines = getMineLocations(parseInt(payload.mines))
  
      let selectedBlocks = payload.selectedBlocks
      console.log('MINES: ', mines)
      console.log('SELECTED BLOCKS: ', selectedBlocks)
  
      // calculate win / loss
      let win = true
      for (var i=0; i < selectedBlocks.length; i++) {
        if (mines.includes(selectedBlocks[i])) {
          win = false
          break
        }
      }
  
      console.log('Win or Loss', win)
      console.log('Payout', payload.payout)
  
      blockValue = (win) ? 1 : 0
      let statusValue = (win) ? 'pending' : 'loss'
        
  
  
      //console.log('MINES: ', mines.toString())
  
      const user = jwt.verify(
        payload.token, 
        'keyboardcat'
      )
  
  
      db.Log.create({
        
        betAmount: payload.betAmount,
        mines: mines.toString(),
        userId: user.id,
        payout: payload.payout,
        status: statusValue
  
      }).then(log => {
  
        let returnPayload = {
          id: log.id,
          type: 'NEW_GAME',
          blockValue: blockValue,
          status: statusValue,
          betAmount: payload.betAmount,
          selectedBlocks: payload.selectedBlocks,
          payout: payload.payout,
          winAmount: 0
        }

        if (!win) {
          let betAmount = parseFloat(payload.betAmount)
          console.log('BET AMOUNT: ', betAmount)
          //console.log('PAYOUT AMOUNT: ', payload.payout)
          //let winAmount = betAmount * payload.payout
          //console.log('win AMOUNT: ', winAmount)

          db.User.update({
            hex_balance: db.sequelize.literal(`hex_balance - ${betAmount}`)
          }, {
            where: {
              id: user.id
            }
          }).then(updatedUser => {
      
            console.log('The user was successfully updated: ', updatedUser)
            balance.emit('lossAmount', betAmount)
      
          }).catch(function(error) {
      
            console.log('Failed to update the user: ', error)
      
          })
          returnPayload.payout = 0.0
        } 
  
        res.status(200).send(returnPayload)
  
      }).catch(error => {
  
        console.log(error)
        res.status(500).send(error)
  
      })
  
    } else {
  
      console.log('Already got one try to update', payload)
  
      db.Log.findOne({
  
        where: {
          id: parseInt(payload.gameId)
        }
  
      }).then(log => {
  
        //console.log('Found following game', log)
        let selectedBlocks = payload.selectedBlocks
        let mines = log.mines.split(',')
        console.log('MINES: ', mines)
        console.log('SELECTED BLOCKS: ', selectedBlocks)
  
  
        // calculate win / loss
        let win = true
        for (var i = 0; i < selectedBlocks.length; i++) {
          if (mines.includes(selectedBlocks[i])) {
            win = false
            break
          }
        }
  
        let blockValue = (win) ? 1 : 0
        let statusValue = (win) ? 'pending' : 'loss'

        let returnPayload = {
          id: log.id,
          type: 'EXISTING_GAME',
          blockValue: blockValue,
          status: statusValue,
          betAmount: payload.betAmount,
          selectedBlocks: payload.selectedBlocks,
          payout: payload.payout,
          winAmount: 0
        }
  
  
        // update database to say game failed
        if (statusValue === 'loss') {
          db.Log.update({
            status: 'loss',
            payout: 0.0
          }, {
            where: {
              id: parseInt(payload.gameId)
            }
          }).then(newLog => {
    
            console.log('Game lost and updated: ', newLog)
    
          }).catch(function(error) {
            console.log('Failed to update game: ', newLog)
    
          })




          let betAmount = parseFloat(payload.betAmount)
          console.log('BET AMOUNT: ', betAmount)
          //console.log('PAYOUT AMOUNT: ', payload.payout)
          //let winAmount = betAmount * payload.payout
          //console.log('win AMOUNT: ', winAmount)

          db.User.update({
            hex_balance: db.sequelize.literal(`hex_balance - ${betAmount}`)
          }, {
            where: {
              id: user.id
            }
          }).then(updatedUser => {
      
            console.log('The user was successfully updated: ', updatedUser)
            balance.emit('lossAmount', betAmount)
      
          }).catch(function(error) {
      
            console.log('Failed to update the user: ', error)
            //res.status(200).send(returnPayload)
          })

          returnPayload.payout = 0.0
  
        }
        

        
  
        res.status(200).send(returnPayload)
  
      }).catch(function(error) {
  
        console.log(error)
  
      })
    }
  }
  
})

module.exports = router