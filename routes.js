var Boom = require('boom')
var Bcrypt = require('bcrypt')

var Users = {
  "AZ@az.com": {
    "password": "$2a$04$YPy8WdAtWswed8b9MfKixebJkVUhEZxQCrExQaxzhcdR2xMmpSJiG", //studio
    "username": "AZ@az.com"
  }
}

var routes = [
  {
    method: 'GET',
    path: '/login',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      handler: function (request, reply) {
        if (request.auth.isAuthenticated) {
          return reply.redirect('/home')
        }

        return reply.view('login')
      }
    }
  },
  {
    method: 'POST',
    path: '/login',
    config: {
      // auth: 'session',
      auth: {
        mode: 'try'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      handler: function (request, reply) {
        if (request.auth.isAuthenticated) {
          return reply.redirect('/home')
        }

        var username = request.payload.username
        var user = Users[ username ]

        if (!user) {
          return reply(Boom.notFound('No user registered with given credentials'))
        }

        var password = request.payload.password

        return Bcrypt.compare(password, user.password, function (err, isValid) {
          if (isValid) {
            request.server.log('info', 'user authentication successful')
            request.cookieAuth.set(user);
            return reply.redirect('/home')
          }

          return reply.view('login')
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/home',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      handler: function (request, reply) {
        if (request.auth.isAuthenticated) {
          return reply.view('home')
        }

        return reply.redirect('/login')
      }
    }
  },
  {
    method: 'GET',
    path: '/css/{name}',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      handler: function (request, reply) {
        reply.file('./web/css/' + request.params.name);
      }
    }
  },
  {
    method: 'GET',
    path: '/js/{name}',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      },
      handler: function (request, reply) {
        reply.file('./web/js/' + request.params.name);
      }
    }
  },
  {
    method: 'GET',
    path: '/logout',
    config: {
      auth: 'session',
      handler: function (request, reply) {
        request.cookieAuth.clear();
        reply.redirect('/login')
      }
    }
  },
  {
    method: 'POST',
    path: '/userAuth',
    config: {
      handler: function (request, reply) {
        var userKey = request.payload.userKey
        return reply({
          "result": "ok"
        });
      }
    }
  }
]

module.exports = routes