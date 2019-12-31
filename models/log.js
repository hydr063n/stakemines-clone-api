'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('log', {
    text: DataTypes.TEXT,
  }, {});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};