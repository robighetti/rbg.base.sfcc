'use strict';

var server = require('server');

server.extend(module.superModule);

server.append('Login', function (req, res, next) {
  var viewData = res.getViewData();

  next();
});

module.exports = server.exports();
