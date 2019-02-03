'use strict';
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    name: {
      type:DataTypes.STRING
    },
    alias: {
      type:DataTypes.STRING
    }
  }, {});
  Group.associate = function(models) {
    // associations can be defined here
    Group.hasMany(models.User);
  };
  return Group;
};