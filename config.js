var config = module.exports;

config.jwt = {
    secret: 'kulikuliNaDmA!nTh1ng'
}

var userRoles = config.userRoles = {
    super_admin: 1,
    field_agent: 2,
    moderator: 3,
    investor: 4
}

config.accessLevels = {
    investor: userRoles.investor,
    moderator: userRoles.moderator,
    field_agent: userRoles.field_agent,
    super_admin: userRoles.super_admin
};


