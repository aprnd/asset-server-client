var AssetServerClient = require('../index').AssetServerClient;
var fs = require('fs');
var async = require('async');

var fileBuffer;

if(process.argv[2] && process.argv[3] && process.argv[4] && process.argv[5] && process.argv[6] && process.argv[7] && process.argv[8] && process.argv[9]) {

  var client = new AssetServerClient({
    domain: process.argv[2], 
    port: process.argv[3],
    bucket: process.argv[4],
    apiKey: process.argv[5],
    apiSecret: process.argv[6]
  });

  fs.stat(process.argv[7], function(err, stat) {

    var req = client.put(process.argv[8], {
      'Content-Type': process.argv[9],
      'Content-Length': stat.size
    });

    console.log('------');
    console.log('Testing PUT upload of '+process.argv[7]+' (of type '+process.argv[9]+') to https://'+client.opts.bucket+'.'+client.opts.domain+':'+client.opts.port+process.argv[8]);
    console.log('------');
    console.log(req);

    fs.createReadStream(process.argv[7]).pipe(req);

    req.on('end', function(response) {
      console.log('end: ', response);
      return response;
    });

    req.on('error', function(err) {
      console.log('error: ', err);
      return err;
    });

  });

}
else {
  console.log('Usage: node asset-server-test-PUT hostname.asset-server.com port bucketname apikey apisecret filename.ext /path/on/asset-server/filename.ext filetype');
  process.exit();
}