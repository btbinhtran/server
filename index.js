var createApp = require('tower-app')
  , express   = require('express')
  , app       = express();
/**
 * @package Tower-Server
 */

module.exports = function(program) {
  return Server.create(program);
}

/**
 * Constructor
 */

function Server(args) {
  this.app = createApp(app);
}



Server.create = function(args) {
  return new Server(args);
};