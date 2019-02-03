'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName:{
      type: DataTypes.STRING
    },
    lastName:{
      type:DataTypes.STRING
    },
    email:{
      type:DataTypes.STRING
    },
    password:{
      type:DataTypes.STRING
    },
    username: {
      type:DataTypes.STRING
    },
    groupId:{
      type:DataTypes.INTEGER
    },
    token:{
      type:DataTypes.INTEGER
    },
    isActive:{
      type:DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.belongsTo(models.Group);
  };
  return User;
};