'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    image: {
      type: DataTypes.TEXT,
      defaultValue: 'https://pbs.twimg.com/profile_images/1204557257435963395/qvXFitVY_400x400.jpg'
    },
    hex_address: {
      type: DataTypes.TEXT,
      defaultValue: '0x0',
    },
    hex_balance:  {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
    lol_address: {
      type: DataTypes.TEXT,
      defaultValue: '0x0',
    },
    lol_balance: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
    },
  }, {})
  user.associate = function(models) {
    // associations can be defined here
  }
  return user
}