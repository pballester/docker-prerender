'use strict';

var width = 1024; // 1440;
var height = 1024; // 718;

module.exports = {
  onPhantomPageCreate: function (phantom, req, res, next) {
    req.prerender.page.run(width, height, function (width, height, resolve) {
      this.viewportSize = {
        width: width,
        height: height
      };
      resolve();
    }).then(function () {
      next();
    }).catch(function (err) {
      console.log('custom viewport size error', err);
    });
  }
};
