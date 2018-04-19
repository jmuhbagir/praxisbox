var cron = require('node-cron');
var sensorData = require('../sensor/data');
var redis = require('../storage/redis');

exports.runMQTTSender = function(client){
  var data = {};
  var crontab = cron.schedule('*/20 * * * * *', function(){
    redis.allkeys('sensor.*',function(keys){
       keys.forEach(elem => {
        redis.readObj(elem, function (io) {
          if(io.status == 'started'){
            data[io.id] = io.payload;
          }
        });
      });
    });

    if(JSON.stringify(data) !== '{}')
       client.publish("v1/devices/me/telemetry",JSON.stringify(data));
  });

  return crontab;
}
