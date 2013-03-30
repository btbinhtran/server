
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

}

Server.create = function(args) {
  return new Server(args);
};