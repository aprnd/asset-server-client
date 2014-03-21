var crypto = require('crypto');

function Headers(key, headers, method, opts) {
  this.key = key;
  this.passedHeaders = headers;
  this.headers = {};
  this.httpVerb = method;
  this.opts = opts;
  this.constructAllHeaders();
  return this.headers;
}

Headers.prototype.init = function init (key, headers, method, opts) {
  return new Headers(key, headers, method, opts);
};

Headers.prototype.getHeader = function(prop, obj) {
  var ret = false;
  lcProp = prop.toLowerCase();
  for(var l in obj) {
    if(l.toLowerCase() === lcProp) { ret = obj[l]; }
  }
  return ret;
};

Headers.prototype.constructCanonicalizedAmzHeaders = function constructCanonicalizedAmzHeaders() {
  return this.canonicalizedAmzHeaders = "";
};

/**
 * CanonicalizedResource = [ "/" + Bucket ] +
 * <HTTP-Request-URI, from the protocol name up to the query string> +
 * [ subresource, if present. For example "?acl", "?location", "?logging", or "?torrent"];
 */
Headers.prototype.constructCanonicalizedResource = function constructCanonicalizedResource() {
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
Headers.prototype.constructSignableString = function constructSignableString() {
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
Headers.prototype.constructSignature = function constructSignature() {
  return this.signature = crypto.createHmac('sha1', this.opts.apiSecret).update(this.constructSignableString().toString('UTF-8')).digest('hex');
};

/**
 * Authorization = "AWS" + " " + AWSAccessKeyId + ":" + Signature;
 */
Headers.prototype.constructAuthorization = function constructAuthorization() {
  return this.headers['Authorization'] = 'Basic ' + new Buffer('AWS' + ' ' + this.opts.apiKey + ':' + this.constructSignature()).toString('base64');
};

/**
 * Construct a single header either from the passed headers (preferred) or by calling a callback on the buffer
 */
Headers.prototype.constructHeader = function constructHeader(headerName, callback) {
  var passedHeader = this.getHeader(headerName, this.passedHeaders);
  if(passedHeader) {
    this.headers[headerName] = passedHeader;
  }
  else this.headers[headerName] = "";
};

/**
 * http://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonRequestHeaders.html
 */

Headers.prototype.constructAllHeaders = function constructAllHeaders(afterConstructionCallback) {

  var d = new Date();
  
  this.headers['Date'] = d.setMinutes(d.getMinutes() + this.opts.expiryMinutes);

  if(this.httpVerb === 'PUT') {
    this.constructHeader('Content-MD5');
    this.constructHeader('Content-Length');
    this.constructHeader('Content-Type');
  }

  this.constructAuthorization();

};

module.exports = Headers;