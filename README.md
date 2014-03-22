# Asset-server-client

Client module for asset-server (https://github.com/aprnd/asset-server)

## Requirements

- Node.JS >= 0.10.21

## Installing/testing

1. Install asset-server
2. Run npm install after getting asset-server-client
3. Go to test/
4. Assuming your server is running locally, you can create a bucket with:

```
    $ node createbucket.js local.asset-server.com 5604 "Testing bucket" testerbucket SomeReallyPrivateBucketCreationKey
    ------
    Creating bucket Testing bucket
    ------
    STATUS: 200
    HEADERS: {"content-type":"application/json","content-length":"159","date":"Sat, 22 Mar 2014 16:52:38 GMT","connection":"keep-alive"}
    SUCCESS creating bucket testerbucket (named SomeReallyPrivateBucketCreationKey) on local.asset-server.com:5604
    BODY: {"subdomain":"testerbucket","name":"Testing bucket","apiKey":"66a26c035f773c3b63c4206faf484b94337f2c79","apiSecret":"f6475557309a0e3ffc320f2e13a8a82f6a0e3df8"}
```

5. It should return an api key and a secret that you can use to access your new bucket like so:

```
    $ node put.js local.asset-server.com 5604 testerbucket 66a26c035f773c3b63c4206faf484b94337f2c79 f6475557309a0e3ffc320f2e13a8a82f6a0e3df8 napoleon.jpg /test/napoleon.jpg image/jpg
    ------
    Testing PUT upload of napoleon.jpg (of type image/jpg) to testerbucket.local.asset-server.com:5604/test/napoleon.jpg
    ------
    { key: '/test/napoleon.jpg',
      passedHeaders: { 'Content-Type': 'image/jpg', 'Content-Length': 19397 },
      headers: 
       { Date: 1395507882053,
         'Content-Length': 19397,
         'Content-Type': 'image/jpg',
         Authorization: 'Basic QVdTIDY2YTI2YzAzNWY3NzNjM2I2M2M0MjA2ZmFmNDg0Yjk0MzM3ZjJjNzk6NWU1MzFmMjVjNDY0MTJhMDFhMWQ2NjRjODVjNDVjYTZmOTQ5Zjc4OA==' },
      httpVerb: 'PUT',
      opts: 
       { domain: 'local.asset-server.com',
         port: '5604',
         bucket: 'testerbucket',
         apiKey: '66a26c035f773c3b63c4206faf484b94337f2c79',
         apiSecret: 'f6475557309a0e3ffc320f2e13a8a82f6a0e3df8',
         host: 'testerbucket.local.asset-server.com',
         socketTimeout: 10000,
         expiryMinutes: 10 },
      
      [ ... ]

      headers: 
       { 'x-amz-version-id': '51f7ea03dfd0611115a8aad88c8130c4',
         date: 'Sat, 22 Mar 2014 16:54:42 GMT',
         connection: 'keep-alive',
         'transfer-encoding': 'chunked' },

      [ ... ]

      SUCCESS PUT testerbucket.local.asset-server.com:5604/test/napoleon.jpg
```

6. Try loading http://testerbucket.local.asset-server.com:5604/test/napoleon.jpg in your browser. You can also load versions with the query string ?versionId returned from the PUT request header x-amz-version-id. For example in this case, http://testerbucket.local.asset-server.com:5604/test/napoleon.jpg?versionId=51f7ea03dfd0611115a8aad88c8130c4.
