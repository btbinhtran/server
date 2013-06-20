
/**
 * Module dependendencies.
 */

var application = {};
var express = require('express');
var sockjs = require('sockjs');
//var Bundle = require('tower-bundle');
var http = require('http');
var instance;

/**
 * Expose `server`.
 */

module.exports = server;

/**
 * Create singleton `Server`.
 *
 * @param {Object} args Server setup options like port number and environment.
 * @return {Server} A server object.
 * @api public
 */

function server(args) {
  if (instance) return instance;
  return instance = new Server(args);
}

/**
 * Class representing a server
 *
 * @class
 * 
 * @param {Object} args Server setup options like port number and environment.
 * @api public
 */

function Server(args) {
  this.options = {
    port: args.port || 3000,
    environment: args.environment || 'development'
  }

  this.io = sockjs.createServer({
    sockjs_url: 'http://cdn.sockjs.org/sockjs-0.3.min.js',
    log: function() {}
  });

  this.openSockets = [];
  this.callbacks = [];
  this.express = express();
  this.bundle = new Bundle(this);

  this.initializeSockets();

  // Middleware.
  // XXX: Move this into a separate method of it's own.
  this.express.use('/public', express.static(process.cwd() + '/public'));

  this.app = application;

  this.server = http.createServer(this.express);
  this.io.installHandlers(this.server, { prefix: '/echo' });
}

/**
 * Start server and listen on it's specified port number.
 *
 * @api public
 */

Server.prototype.listen = function(){
  this.server.listen(this.options.port, '0.0.0.0');
  console.log("Tower is listening on " + this.options.port);
};

/**
 * Initialize sockets.
 *
 * @api public
 */

Server.prototype.initializeSockets = function(){
  var self = this;

  this.io.on('connection', function(socket){
    socket.send = function(data){
      socket.write(data);
    };

    socket.on('data', function(message){
      console.log(message);
    });

    socket.on('close', function(){
      var open = [];
      for (var i = 0, n = self.openSockets.length; i < n; i++) {
        if (self.openSockets[i] !== socket) {
          open.push(self.openSockets[i]);
        }
      }
      self.openSockets = open;
    });

    self.openSockets.push(socket);

    self.callbacks.forEach(function(fn){
      fn(socket);
    });
  });
};

/**
 * Emit data to all open sockets.
 *
 * @param {Object} data Data to send to open sockets.
 * @api public
 */

Server.prototype.emit = function(data){
  this.openSockets.forEach(function(socket){
    socket.send(JSON.stringify(data));
  });
};