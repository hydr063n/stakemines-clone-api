var express = require('express')
var jwt = require('jsonwebtoken')
var Cookies = require('universal-cookie')
var bcrypt = require('bcrypt')
var db = require('../data/db.js')
var router = express.Router()
var urlencode = require('urlencode')

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

router.get('/', function(req, res, next) {
  db.Message
  .findAll({
    include: db.User
  })
  .then((messages) => {

    console.log(messages)

    res.set('Content-Type', 'application/json');
    res.send(messages)

  }).catch((error) => {
    console.log(error)
  })
})

router.post('/getMessage', function(req, res, next) {
  console.log('DATA')
  console.log(req.body)

  const message = req.body.payload.message
  const user = req.body.payload.user

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
    } else {
      db.User.findOne({
        where: {
          email: payload.username
        }
      }).then(nuser =>{
        if (nuser) {
          console.log('This username has already been used!')
        } else {
          
          db.User.create({
            username: payload.username,
            email: payload.email,
            password: payload.password,
          }).then(newUser => {

            console.log(newUser)

            var token = jwt.sign({
              id: newUser.id,
            }, 'keyboardcat', {
              expiresIn: 86400 // expires in 24 hours
            })

            var response = {
              username: newUser.username,
              token: token,
              isLoggedIn: true,
              message: 'You have successfully registered!'
            }

            res.send(response)

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
  console.log(payload.username)
  console.log(payload.password)

  db.User.findOne({
    where: {
      email: payload.username,
      password: payload.password
    }
  }).then(user => {
    if (user) {
      console.log(user)

      var token = jwt.sign({ id: user.id }, 'keyboardcat', {
        expiresIn: 86400 // expires in 24 hours
      })

      req.session.token = token

      var response = {
        username: user.username,
        isLoggedIn: true,
        token: token,
        message: 'You have successfully logged in.'
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
          console.log('You have logged in with username!')

          var token = jwt.sign({
              id: nuser.id,
              username: nuser.username
            }, 
            'keyboardcat',
            {
              expiresIn: 86400 // expires in 24 hours
            })
          
          req.session.token = token

          var response = {
            isLoggedIn: true,
            token: token,
            message: 'You have successfully logged in.'
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

/*router.get('/testcookies', function(req, res, next) {
  const cookies = new Cookies(req.headers.cookie)
  console.log(cookies.get('id'))
  console.log('Saved one')
  console.log(req.session.token)
})*/

router.post('/testToken', function(req, res, next) {
  const payload = req.body.payload
  console.log(payload)

  const data = jwt.verify(payload, 'keyboardcat')
  console.log(data);

})

module.exports = router