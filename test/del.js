var AssetServerClient = require('../index').AssetServerClient;
var fs = require('fs');

var fileBuffer;

if(process.argv[2] && process.argv[3] && process.argv[4] && process.argv[5] && process.argv[6] && process.argv[7]) {

  var client = new AssetServerClient({
    domain: process.argv[2], 
    port: process.argv[3],
    bucket: process.argv[4],
    apiKey: process.argv[5],
    apiSecret: process.argv[6]
  });

  var res;
  var req = client.del(process.argv[7]);
  console.log('------');
  console.log('Testing DEL of '+process.argv[7]);
  console.log('------');

  req.on('end', function(response) {
    console.log('end: ', response);
    if(response.statusCode === 200) { console.log('SUCCESS DEL '+client.opts.bucket+'.'+client.opts.domain+':'+client.opts.port+process.argv[7]); }
    return response;
  });

  req.on('error', function(err) {
    console.log('ERROR DEL '+client.opts.bucket+'.'+client.opts.domain+':'+client.opts.port+process.argv[7], err);
    return err;
  });

}
else {
  console.log('Usage: node del.js hostname.asset-server.com port bucketname apikey apisecret /path/on/asset-server/filename.ext');
  process.exit();
}