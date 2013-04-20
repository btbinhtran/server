var application = require('tower-app')
  , express = require('express')
  , sockjs = require('sockjs')
  , instance = null
  , Bundle = require('tower-bundle')
  , http = require('http');

/**
 * @package Tower-Server
 */

module.exports = function(args) {
  if (instance) return instance;
  return instance = new Server(args);
}

module.exports.instance = function() {
  return instance;
}

/**
 * Constructor
 */

function Server(args) {
  var self = this;

  this.options = {
    port: args.port || 3000,
    environment: args.environment || "development"
  }

  this.io = sockjs.createServer({
    sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"
    , log: function() {}
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
  this.app.init(this);


  this.server = http.createServer(this.express);
  this.io.installHandlers(this.server, {
    prefix: '/echo'
  });
}

Server.prototype.listen = function() {
  this.server.listen(this.options.port, '0.0.0.0');
  console.log("Tower is listening on " + this.options.port)
};

Server.prototype.initializeSockets = function() {
  var self = this;
  this.io.on('connection', function(socket) {

    socket.send = function(data) {
      socket.write(data);
    };

    socket.on('data', function(message) {
      console.log(message);
    });

    socket.on('close', function() {
      var open = [];
      for (var i = 0, n = self.openSockets.length; i < n; i++) {
        if (self.openSockets[i] !== socket) {
          open.push(self.openSockets[i]);
        }
      }
      self.openSockets = open;
    });

    self.openSockets.push(socket);

    self.callbacks.forEach(function(cb) {
      cb(socket);
    })

  });

};

Server.prototype.emit = function(data) {
  var self = this;

  this.openSockets.forEach(function(socket) {
    socket.send(JSON.stringify(data));
  });

};