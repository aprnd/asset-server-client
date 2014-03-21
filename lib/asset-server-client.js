"use strict";

var bcrypt = require('bcrypt');
var async = require('async');
var crypto = require('crypto');
var AssetServerRequest = require('./asset-server-request');
var http = require('http');

/**
 * AssetServerClient
 * @param {Object} opts = {
 *   domain: 'local.asset-server.com',
 *   port: 5604,
 *   bucket: 'aprnd',
 *   apiKey: '',
 *   apiSecret: ''
 * }
 */
function AssetServerClient (opts) {
  /* jshint validthis: true */
  if(opts) this.opts = opts;
  else this.opts = {};
  this.opts.host = this.opts.bucket + '.' + this.opts.domain;

  this.opts.socketTimeout = opts.socketTimeout ? opts.socketTimeout : 10000;
  this.opts.expiryMinutes = opts.expiryMinutes ? opts.expiryMinutes : 10;
}

AssetServerClient.prototype.init = function init () {
  return new AssetServerClient();
};

/**
 * Create a PUT request from a buffer
 */
AssetServerClient.prototype.put = function put(key, headers) {
  var request = new AssetServerRequest(key, headers, 'PUT', this.opts);
  request.send();
  return request;
};

/**
 * Create a DEL request
 */
AssetServerClient.prototype.del = function del(key) {
  var request = new AssetServerRequest(key, {}, 'DELETE', this.opts);
  request.send();
  return request;
};

/**
 * Create a GET request
 */
AssetServerClient.prototype.get = function get(key) {
  var request = new AssetServerRequest(key, {}, 'GET', this.opts);
  request.send();
  return request;
};

/**
 * Create a HEAD request
 */
AssetServerClient.prototype.head = function head(key) {
  var request = new AssetServerRequest(key, {}, 'HEAD', this.opts);
  request.send();
  return request;
};

module.exports = AssetServerClient;