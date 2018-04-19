var mqtt = require('mqtt');
var prompt = require('prompt');
var redis = require('../storage/redis');

exports.run = function(key){
  switch (key) {
    case "add":
      add({},function(){
      });
      break;
    case "get":
      get(function(obj){
        console.log(obj);
      });
      break;
    default:
      console.log('Usage: attribute <add,get>');
      break;
  }
};

function add(obj,callback){
  prompt.message = '';
  prompt.start();
  prompt.get([{
      description: 'Enter the key of attribute',
      name: 'key',
      required: true
      },
      {
        description: 'Enter the value',
        name: 'value',
        required: true
      },
      {
        description: 'Add more attribute (Y/N)',
        name: 'more',
        required: true
      }
      ], function (err, result) {
        obj[result.key] = result.value;
        if(result.more == 'Y' || result.more == 'y'){
          add(obj,function(){
          });
        }else{
          redis.read('credential',function(value){
            if(value==undefined){
              console.log('Please register your device first!');
              throw err;
            }
            var credential = value;
            redis.read('mqtt_host',function(value){
              if(value == undefined){
                console.log('Please set mqtt_host variable!');
                throw err;
              }else{
                var host = value;
                redis.read('mqtt_port',function(value){
                  if(value==undefined){
                    value = '1883';
                  }
                  var port = value;
                  var client  = mqtt.connect('mqtt://'+ host,{
                    port: port,
                    username: credential
                  });

                  client.on('connect', function () {
                    console.log('Connected');
                    client.publish('v1/devices/me/attributes', JSON.stringify(obj));
                  });

                  client.on('error',function(error){
                    console.log('Connection error '+error);
                  });

                  client.on('packetsend', function (topic, message) {
                    console.log('Attributes submitted!');
                    client.end();
                  });
                });
              }
             });
           });
        }
    });
};

function get(callback){
  redis.read('credential',function(value){
    if(value==undefined){
      console.log('Please register your device first!');
      throw err;
    }
    var credential = value;
    redis.read('mqtt_host',function(value){
      if(value == undefined){
        console.log('Please set mqtt_host variable!');
        throw err;
      }else{
        var host = value;
        redis.read('mqtt_port',function(value){
          if(value==undefined){
            value = '1883';
          }
          var port = value;
          var client  = mqtt.connect('mqtt://'+ host,{
            port: port,
            username: credential
          });

          client.on('connect', function () {
            console.log('Connected!');
            client.subscribe('v1/devices/me/attributes/response/+');
            client.publish('v1/devices/me/attributes/request/1', '{}')
          })

          client.on('message', function (topic, message) {
            client.end();
            return callback(message.toString('utf8'));
          })

          client.on('error',function(error){
            return callback('Connection error '+error);
          });
        });
      }
     });
   });
};
