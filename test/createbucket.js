var AssetServerClient = require('../index').AssetServerClient;
var fs = require('fs');
var http = require('http');

if(process.argv[2] && process.argv[3] && process.argv[4] && process.argv[5] && process.argv[6]) {

  var options = {
    hostname: process.argv[2],
    port: process.argv[3],
    path: '/bucket',
    method: 'POST'
  };

  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    if(res.statusCode === 200) { console.log('SUCCESS creating bucket '+process.argv[5]+' (named '+process.argv[6]+') on '+options.hostname+':'+options.port); }
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  req.setHeader('name', process.argv[4]);
  req.setHeader('subdomain', process.argv[5]);
  req.setHeader('bucketkey', process.argv[6]);

  console.log('------');
  console.log('Creating bucket '+process.argv[4]);
  console.log('------');

  req.on('error', function(err) {
    console.log('error: ', err);
    return err;
  });

  req.end();

}
else {
  console.log('Usage: node createbucket hostname.asset-server.com port bucketname bucketsubdomain bucketcreationkey');
  process.exit();
}