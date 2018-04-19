var prompt = require('prompt');
var parser = require('../utils/parser');
var redis = require('../storage/redis');
var Client = require('node-rest-client').Client;
var client = new Client();
var praxis_url;

exports.run = function(){
  redis.read('praxis_url',function(value){
    if(value==undefined){
      value = 'http://dev.praxis.sml:14000';
    }
    praxis_url = value;
  });
  prompt.message = '';
  prompt.start();
  prompt.get([{
        description: 'Enter your device ID ',
        name: 'deviceId',
        required: true
      }
      ], function (err, result) {
        client.registerMethod("register", praxis_url.concat("/api/device/").concat(result.deviceId).concat("/credentials"), "GET");
        redis.read('token',function(token){
          var args = {
            headers: { "Accept": "*/*", "X-Authorization": "Bearer ".concat(token)}
          }

          client.methods.register(args, function(data, response){
            parser.parseJSON(data,function(result){
              if(result.id == null){
                console.log(result);
              }else{
                redis.save('credential',result.credentialsId,function(reply){});
                console.log("Device Registered!");
              }
            });
          });
      });
  });
};
