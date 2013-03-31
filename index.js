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
  this.environment = args.environment || "development";
  this.app = createApp(app, this);
}



Server.create = function(args) {
  return new Server(args);
};