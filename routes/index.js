var express = require('express')
var jwt = require('jsonwebtoken')
var Cookies = require('universal-cookie')
var bcrypt = require('bcrypt')
var db = require('../data/db.js')
var router = express.Router()

router.get('/', function(req, res, next) {
  res.send('Hex FM API')
})

router.post('/user/register', function(req, res, next) {
  console.log(req.body.email)

  db.User.findOne({
    where: {
      email: req.body.email
    }
  }).then(user =>{
    if (user) {
      console.log('This email has already been used')
    } else {
      db.User.findOne({
        where: {
          email: req.body.username
        }
      }).then(nuser =>{
        if (nuser) {
          console.log('This username has already been used!')
        } else {
          
          db.User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
          }).then(newUser => {

            console.log(newUser)

            var token = jwt.sign({ id: user.id }, 'keyboardcat', {
              expiresIn: 86400 // expires in 24 hours
            })
      
            var txt = 'You have registered! Token: ' + token
            console.log(txt)
            txt = txt + newUser
            res.send(txt)

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

  console.log(req.body.email)
  console.log(req.body.password)

  db.User.findOne({
    where: {
      email: req.body.email,
      password: req.body.password
    }
  }).then(user => {
    if (user) {
      console.log(user)

      var token = jwt.sign({ id: user.id }, 'keyboardcat', {
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
      console.log('Unable to find the email')

      db.User.findOne({
        where: {
          username: req.body.email,
          password: req.body.password
        }
      }).then(nuser => {
        if (nuser) {
          console.log('You have logged in with username!')

          var token = jwt.sign({ id: user.id }, 'keyboardcat', {
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
      }).catch(function(err){
        console.log(err)
        console.log('Failed to do the sql query')
      })

    }
  }).catch(function(err) {
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

router.get('/testcookies', function(req, res, next) {
  const cookies = new Cookies(req.headers.cookie)
  console.log(cookies.get('id'))
  console.log('Saved one')
  console.log(req.session.token)
})

module.exports = router