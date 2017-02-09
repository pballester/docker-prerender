#!/usr/bin/env node
'use strict';

var prerender = require('prerender');
var redisCache = require('./lib/redisCache');
var viewPort = require('./lib/viewPort');

var server = prerender({
  workers: process.env.PRERENDER_NUM_WORKERS,
  iterations: process.env.PRERENDER_NUM_ITERATIONS,
  resourceDownloadTimeout: process.env.RESOURCE_DOWNLOAD_TIMEOUT || 40000,
  jsTimeout: process.env.JS_TIMEOUT || 40000
});

server.use(prerender.sendPrerenderHeader());
// server.use(prerender.basicAuth());
// server.use(prerender.whitelist());
// server.use(prerender.blacklist());
// server.use(prerender.logger());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
// server.use(prerender.inMemoryHtmlCache());
// server.use(prerender.s3HtmlCache());
server.use(redisCache);
server.use(viewPort);
server.start();
