#!/usr/bin/env node
'use strict';

var prerender = require('prerender');
var redisCache = require('./lib/redisCache');
var viewPort = require('./lib/viewPort');

var server = prerender({
  chromeFlags: ['--no-sandbox', '--headless', '--disable-gpu', '--remote-debugging-port=9222', '--hide-scrollbars'],
  pageLoadTimeout: process.env.PAGE_LOAD_TIMEOUT || 20 * 1000
});

server.use(prerender.sendPrerenderHeader());
// server.use(prerender.blockResources());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
server.use(viewPort);
server.use(redisCache);

server.start();
