var Hapi = require('hapi')
var Good = require('good')
var Vision = require('vision')
var Handlebars = require('handlebars')
var CookieAuth = require('hapi-auth-cookie')
var inert = require('inert');

var Users = {
  "AZ@az.com": {
    "password": "$2a$04$YPy8WdAtWswed8b9MfKixebJkVUhEZxQCrExQaxzhcdR2xMmpSJiG", // studio
    "username": "AZ@az.com"
  }
}

// create new server instance
var server = new Hapi.Server()

// add server’s connection information
server.connection({
  //host: 'localhost',
  port: process.env.PORT || 5000
})

// register plugins to server instance
server.register([
  {
    register: Vision
  },
  {
    register: Good,
    options: {
      ops: {
        interval: 10000
      },
      reporters: {
        console: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [ { log: '*', response: '*', request: '*' } ]
          },
          {
            module: 'good-console'
          },
          'stdout'
        ]
      }
    }
  },
  {
    register: CookieAuth
  },
  {
    register: inert
  }
], function (err) {
  if (err) {
    server.log('error', 'failed to install plugins')

    throw err
  }

  server.log('info', 'Plugins registered')

  /**
   * view configuration
   */
 server.views({
      engines: {
          html: require('handlebars')
      },
      relativeTo: __dirname,
      path: './web/html'
  });
  server.log('info', 'View configuration completed')

  // validation function used for hapi-auth-cookie: optional and checks if the user is still existing
  var validation = function (request, session, callback) {
    var username = session.username
    var user = Users[ username ]

    if (!user) {
      return callback(null, false)
    }

    server.log('info', 'user authenticated')
    callback(err, true, user)
  }

  server.auth.strategy('session', 'cookie', true, {
    password: 'm!*"2/),p4:xDs%KEgVr7;e#85Ah^WYC',
    cookie: '_wn_benefit_',
    redirectTo: '/login',
    isSecure: false,
    validateFunc: validation
  })

  server.log('info', 'Registered auth strategy: cookie auth')

  var routes = require('./routes')
  server.route(routes)
  server.log('info', 'Routes registered')

  // start your server after plugin registration
  server.start(function (err) {
    if (err) {
      server.log('error', 'failed to start server')
      server.log('error', err)

      throw err
    }

    server.log('info', 'Server running at: ' + server.info.uri)
  })
})