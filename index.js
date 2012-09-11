
module.exports = {
  SuperMock: require('./lib/supermock'),
  patch: require('./lib/patch').patch,
  restore: require('./lib/patch').restore
};