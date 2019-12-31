const { Sequelize, Model, DataTypes } = require('sequelize')

const sequelize = new Sequelize('webapp','root','', {
    host: 'localhost',
    dialect: 'mysql'
})

var UserModel = require('../models/user')
var LogModel = require('../models/log')
var SettingModel = require('../models/setting')

const User = UserModel(sequelize, Sequelize)
const Log = LogModel(sequelize, Sequelize)
const Setting = SettingModel(sequelize, Sequelize)

User.hasMany(Log)
Log.belongsTo(User)

sequelize.sync().then(() => {
  console.log(`Database & tables created!`)
})

module.exports = {
  User,
  Log,
  Setting
}