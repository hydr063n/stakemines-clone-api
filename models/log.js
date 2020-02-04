'use strict';
module.exports = (sequelize, DataTypes) => {
  const log = sequelize.define('log', {
    betAmount: {
      type: DataTypes.STRING,
      defaultValue: '0.00000000'
    },
    status: {
      type: DataTypes.ENUM('pending', 'win', 'loss'),
      defaultValue: 'pending'
    },
    mines: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
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