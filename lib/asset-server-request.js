/**
 * A request to asset-server.
 * Mimicks a request to AWS S3.
 *
 * See S3 docs:
 * http://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonRequestHeaders.html
 * http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html
 * http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectOps.html
 */

var crypto = require('crypto');
var util = require('util');
var http = require('http');
var async = require('async');
var stream = require('stream');

function AssetServerRequest (key, headers, method, opts) {
  /* jshint validthis: true */
  this.key = key;
  this.passedHeaders = headers;
  this.headers = {};
  this.httpVerb = method;
  this.opts = opts;
  this.bytesTotal = 0;
  this.bytesWritten = 0;

  stream.Writable.call(this);

}

util.inherits(AssetServerRequest, stream.Writable);

AssetServerRequest.prototype.send = function send() {

  var self = this;

  self.constructAllHeaders(function() {

    var options = {
      host: self.opts.host,
      method: self.httpVerb,
      port: self.opts.port,
      path: self.key,
      headers: self.headers
    };

    var req = http.request(options,
      function(response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
          self.emit('data', chunk);
        });
        response.on('end', function(data) {
          if(response.statusCode === 200) {
            self.emit('end', response);
          }
          else {
            self.emit('error', response.statusCode);
          }
        });
      }
    );

    req.on('socket', function (socket) {
      socket.setTimeout(self.opts.SocketTimeout);
      socket.on('timeout', function() {
        req.abort();
        self.emit('error', 'socket timeout');
      });
    });

    req.on('error', function(e) {
      self.emit('error', e);
    });

    self.req = req;

  });

};

AssetServerRequest.prototype.init = function init (key, headers, method, opts) {
  return new AssetServerRequest(key, headers, method, opts);
};

AssetServerRequest.prototype.getHeader = function(prop, obj) {
  var ret = false;
  lcProp = prop.toLowerCase();
  for(var l in obj) {
    if(l.toLowerCase() === lcProp) { ret = obj[l]; }
  }
  return ret;
};

AssetServerRequest.prototype.constructCanonicalizedAmzHeaders = function constructCanonicalizedAmzHeaders() {
  return this.canonicalizedAmzHeaders = "";
};

/**
 * CanonicalizedResource = [ "/" + Bucket ] +
 * <HTTP-Request-URI, from the protocol name up to the query string> +
 * [ subresource, if present. For example "?acl", "?location", "?logging", or "?torrent"];
 */
AssetServerRequest.prototype.constructCanonicalizedResource = function constructCanonicalizedResource() {
  return this.canonicalizedResource = '/' +
    this.opts.bucket +
    this.key;
};

/**
 * StringToSign = HTTP-Verb + "\n" +
 * Content-MD5 + "\n" +
 * Content-Type + "\n" +
 * Date + "\n" +
 * CanonicalizedAmzHeaders +
 * CanonicalizedResource;
 */
AssetServerRequest.prototype.constructSignableString = function constructSignableString() {
  return this.signableString = this.httpVerb + '\n' +
    this.headers['Content-MD5'] + '\n' +
    this.headers['Content-Type'] + '\n' +
    this.headers['Date'] + '\n' +
    this.constructCanonicalizedAmzHeaders() + '\n' +
    this.constructCanonicalizedResource();
};

/**
 * Signature = Base64( HMAC-SHA1( YourSecretAccessKeyID, UTF-8-Encoding-Of( StringToSign ) ) );
 */
AssetServerRequest.prototype.constructSignature = function constructSignature() {
  return this.signature = crypto.createHmac('sha1', this.opts.apiSecret).update(this.constructSignableString().toString('UTF-8')).digest('hex');
};

/**
 * Authorization = "AWS" + " " + AWSAccessKeyId + ":" + Signature;
 */
AssetServerRequest.prototype.constructAuthorization = function constructAuthorization() {
  return this.headers['Authorization'] = 'Basic ' + new Buffer('AWS' + ' ' + this.opts.apiKey + ':' + this.constructSignature()).toString('base64');
};

/**
 * Construct a single header either from the passed headers (preferred) or by calling a callback on the buffer
 */
AssetServerRequest.prototype.constructHeader = function constructHeader(headerName, callback) {
  var ret;

  var passedHeader = this.getHeader(headerName, this.passedHeaders);

  if(passedHeader) {
    this.headers[headerName] = passedHeader;
    callback();
  }
  else
    callback();

};

/**
 * http://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonRequestHeaders.html
 */

AssetServerRequest.prototype.constructAllHeaders = function constructAllHeaders(afterConstructionCallback) {

  var self = this;

  async.series([

    function(headerCb) {
      // Header: Date
      self.constructHeader('Date', function() {
        if(!self.headers['Date']) { 
          var d = new Date();
          self.headers['Date'] = d.setMinutes(d.getMinutes() + self.opts.expiryMinutes);
        }
        headerCb();
      });
    },

    function(headerCb) {
      if(self.httpVerb === 'PUT')
        self.constructHeader('Content-MD5', headerCb);
      else headerCb();
    },

    // Header: Content-Length
    function(headerCb) {
      if(self.httpVerb === 'PUT')
        self.constructHeader('Content-Length', function() {
          self.bytesTotal = self.getHeader("content-length", self.headers);
          headerCb();
        });
      else headerCb();
    },

    // Header: Content-Type
    function(headerCb) {
      if(self.httpVerb === 'PUT')
        self.constructHeader('Content-Type', headerCb);
      else headerCb();
    }

  ], function(err) {
    self.constructAuthorization();
    afterConstructionCallback();
  });

};

AssetServerRequest.prototype._write = function _write(chunk, encoding, cb) {
  
  var self = this;

  if(self.req) {
    self.req.write(chunk);
  }

  self.bytesWritten += chunk.length;
  var progress = Math.floor((self.bytesTotal / bytesWritten) * 100);

  // Emit a progress event with percentage done
  self.emit('progress', progress);

  cb();

};

AssetServerRequest.prototype._end = function _end(chunk, encoding, cb) {
  
  var self = this;

  if(self.req) {
    if(chunk) {
      self.req.write(chunk);
    }
    self.req.end();
  }

  if(cb) cb();

};

AssetServerRequest.prototype.end = function() {
  this._end(null, null, null);
};

module.exports = AssetServerRequest;