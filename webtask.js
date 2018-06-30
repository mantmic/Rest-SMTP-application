var Webtask = require('webtask-tools');

module.exports = Webtask.fromExpress(require('./server.js'));
