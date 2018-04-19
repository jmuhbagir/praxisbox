var session = require('net-ping').createSession();
var cron = require('node-cron');
var sensorData = require('../sensor/data');
var actuatorData = require('../actuator/data');
var redis = require('../storage/redis');

exports.runHealthCheck = function(){
  var crontab = cron.schedule('*/10 * * * * *', function(){
    redis.allkeys('sensor.*',function(keys){
       keys.forEach(elem => {
        redis.readObj(elem, function (io) {
          session.pingHost (io.ip, function (error, target) {
            if (error) {
              sensorData.putSensorHealth(io.id,"BAD",function(message){});
            }else{
              sensorData.putSensorHealth(io.id,"GOOD",function(message){});
            }
          });
        });
      });
    });
    redis.allkeys('actuator.*',function(keys){
       keys.forEach(elem => {
        redis.readObj(elem, function (io) {
          session.pingHost (io.ip, function (error, target) {
            if (error) {
              actuatorData.putActuatorHealth(io.id,"BAD",function(message){});
            }else{
              actuatorData.putActuatorHealth(io.id,"GOOD",function(message){});
            }
          });
        });
      });
    });
  });

  return crontab;
}
