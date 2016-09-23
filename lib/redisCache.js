'use strict';

/**
 * Basic Config Variables
 * redisUrl (string) - Redis hostname (defaults to localhost)
 * ttl (int) - TTL on keys set in redis (defaults to 15 days)
 * paramsToIgnore ([string]) - Array of query parameters to be ignored (defaults to [])
 */
var redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  url = require('url'),
  ttl = (process.env.PAGE_TTL || 15) * 86400,
  paramsToIgnore = process.env.PARAMS_TO_IGNORE ? process.env.PARAMS_TO_IGNORE.split(' ') : [];

// Parse out the connection vars from the env string.
var connection = url.parse(redisUrl),
  redis = require('redis'),
  client = redis.createClient(connection.port, connection.hostname),
  redisOnline = false,
  lastError = '',
  lastEndMessage = ''; // Make redis connection

// Select Redis database, parsed from the URL
connection.path = (connection.pathname || '/').slice(1);
connection.database = connection.path.length ? connection.path : '0';
client.select(connection.database);

// Parse out password from the connection string
if (connection.auth) {
  client.auth(connection.auth.split(':')[1]);
}

// Catch all error handler. If redis breaks for any reason it will be reported here.
client.on('error', function(err) {
  if (lastError === err.toString()) {
    // Swallow the error for now
  } else {
    lastError = err.toString();
    console.log('Redis Cache - Error: ' + err);
  }
});
//
client.on('ready', function() {
  redisOnline = true;
  console.log('Redis Cache - Connected');
});

client.on('end', function(err) {
  if (err) {
    err = err.toString();
    if (lastEndMessage === err) {
      // Swallow the error for now
    } else {
      lastEndMessage = err;
      redisOnline = false;
      console.log('Redis Cache - Conncetion Closed. Will now bypass redis until it\'s back.');
    }
  }
});

var cleanUrl = function(url) {
  var removeURLParameter = function(url, parameter) {
    var urlparts = url.split('?');
    if (urlparts.length >= 2) {
      var prefix = encodeURIComponent(parameter) + '=';
      var pars = urlparts[1].split(/[&;]/g);
      for (var i = pars.length; i-- > 0;) {
        if (pars[i].lastIndexOf(prefix, 0) !== -1) {
          pars.splice(i, 1);
        }
      }
      url = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
      return url;
    } else {
      return url;
    }
  };
  if (paramsToIgnore.length > 0) {
    for (var i = 0; i < paramsToIgnore.length; i++) {
      url = removeURLParameter(url, paramsToIgnore[i]);
    }
  }
  return url;
};

module.exports = {
  beforePhantomRequest: function(req, res, next) {
    if (req.method !== 'GET' || redisOnline !== true) {
      return next();
    }
    var prerenderUrl = cleanUrl(req.prerender.url);
    client.get(prerenderUrl, function(err, result) {
      // Page found - return to prerender and 200
      if (!err && result) {
        console.log('Redis Cache - HIT ' + prerenderUrl);
        res.send(200, result);
      } else {
        next();
      }
    });
  },

  afterPhantomRequest: function(req, res, next) {
    if (redisOnline !== true) {
      return next();
    }
    // Don't cache anything that didn't result in a 200. This is to stop caching of 3xx/4xx/5xx status codes
    if (req.prerender.statusCode === 200) {
      var prerenderUrl = cleanUrl(req.prerender.url);
      client.set(prerenderUrl, req.prerender.documentHTML, function(err, reply) {
        // If library set to cache set an expiry on the key.
        if (!err && reply && ttl && ttl !== 0) {
          client.expire(prerenderUrl, ttl, function(err, didSetExpiry) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
    }
    next();
  }
};
