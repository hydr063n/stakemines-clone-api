'use strict';
module.exports = (sequelize, DataTypes) => {
  const log = sequelize.define('log', {
    payout: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    },
    profit: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' }
    }
  }, {});
  log.associate = function(models) {
    // associations can be defined here
  };
  return log;
};