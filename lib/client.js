var bcrypt = require('bcrypt');
var async = require('async');
var crypto = require('crypto');
var Request = require('./request');
var http = require('http');

/**
 * Client
 * @param {Object} opts = {
 *   domain: 'local.asset-server.com',
 *   port: 5604,
 *   bucket: 'aprnd',
 *   apiKey: '',
 *   apiSecret: ''
 * }
 */
function Client (opts) {
  /* jshint validthis: true */
  if(opts) this.opts = opts;
  else this.opts = {};
  this.opts.host = this.opts.bucket + '.' + this.opts.domain;

  this.opts.socketTimeout = opts.socketTimeout ? opts.socketTimeout : 10000;
  this.opts.expiryMinutes = opts.expiryMinutes ? opts.expiryMinutes : 10;
}

Client.prototype.init = function init (opts) {
  return new Client(opts);
};

/**
 * Create a PUT request from a buffer
 */
Client.prototype.put = function put(key, headers) {
  return new Request(key, headers, 'PUT', this.opts);
};

/**
 * Create a DEL request
 */
Client.prototype.del = function del(key) {
  return new Request(key, {}, 'DELETE', this.opts);
};

/**
 * Create a GET request
 */
Client.prototype.get = function get(key) {
  return new Request(key, {}, 'GET', this.opts);
};

/**
 * Create a HEAD request
 */
Client.prototype.head = function head(key) {
  return new Request(key, {}, 'HEAD', this.opts);
};

module.exports = Client;