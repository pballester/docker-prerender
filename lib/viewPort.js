'use strict';

var width = 1024; // 1440;
var height = 1024; // 718;

module.exports = {
  requestReceived: function (req, res, next) {
    req.prerender.width = width,
    req.prerender.height = height
    next();
  }
};
