'use strict';
module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define('transaction', {
    txhash: DataTypes.TEXT,
    value: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('pending','success','failed'),
      defaultValue: 'pending'
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' }
    }
  }, {})

  transaction.associate = function(models) {
    // associations can be defined here
  }

  return transaction
}