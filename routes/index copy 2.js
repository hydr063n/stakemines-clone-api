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


router.all('/minesweeper/bet', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.set('Access-Control-Allow-Credentials', 'http://localhost:3002')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type')
  next()
})

router.all('/minesweeper/cashout', function(req, res, next) {
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

          mineData.push(location)
          //newData[location] = 1
          i++
      }
  }

  //console.log('Mine data: ', mineData)

  return mineData
  
  /*return {
      data: newData,
      mines: mineData
  }*/
}





router.post('/minesweeper/bet', function(req, res, next) {
  const payload = req.body.payload

  console.log(payload)
  res.send('Send back payout rate')

  if (payload.gameId === -1) {


    let mines = getMineLocations(parseInt(payload.mines))

    //console.log('MINES: ', mines.toString())

    const user = jwt.verify(
      payload.token, 
      'keyboardcat'
    )


    db.Log.create({
      
      betAmount: payload.betAmount,
      mines: payload.mines.toString(),
      betAmount: payload.betAmount,
      userId: user.id,
      payout: payload.payout,


    }).then(log => {

      console.log(log)
      res.status(200).send(log.id)

    }).catch(error => {

      console.log(error)
      res.status(500).send(error)

    })

  } else {

    console.log('Already got one try to update')

    /*db.Log.findOne({

      where: {
        id: gameId
      }

    }).then(log => {

      console.log('Found following game', log)
      res.status(200).send(log)

    }).catch(function(error) {

      console.log(error)

    })*/


  }
  

/*
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
  })*/
})


router.post('/minesweeper/cashout', function(req, res, next) {
  const payload = req.body.payload

  console.log(payload)
  res.send('User is cashing out')
})

module.exports = router
