'use strict';
module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define('message', {
    text: DataTypes.TEXT,
    channel: {
      type: DataTypes.STRING,
      defaultValue: 'English'
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' }
    }
  }, {});
  message.associate = function(models) {
    // associations can be defined here
  };
  return message;
};