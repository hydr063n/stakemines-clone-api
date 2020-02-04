'use strict';
module.exports = (sequelize, DataTypes) => {
  const referral = sequelize.define('referral', {
    profit: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    },
    referralUserId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' }
    }
  }, {});
  referral.associate = function(models) {
    // associations can be defined here
  }
  return referral
};