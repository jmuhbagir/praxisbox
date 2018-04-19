var redis = require('../storage/redis');

exports.putSensor = function(id,type,ip,boardid,pin,frequency,status,callback){
  redis.saveObj('sensor.'.concat(id),["id",id,"type",type,"ip",ip,"boardid",boardid,"pin",pin,"frequency",frequency,"status",status],function(message){
    return callback(message);
  });
};

exports.getSensor = function(id,callback){
 redis.readObj('sensor.'.concat(id),function(obj){
   return callback(obj);
 });
};

exports.putSensorHealth = function(id,health,callback){
  redis.saveObj('sensor.'.concat(id),["health",health],function(message){
    return callback(message);
  });
};

exports.putSensorStatus = function(id,status,callback){
  redis.saveObj('sensor.'.concat(id),["status",status],function(message){
    return callback(message);
  });
};

exports.putSensorPayload = function(id,payload,callback){
  redis.saveObj('sensor.'.concat(id),["payload",payload],function(message){
    return callback(message);
  });
};

exports.dropSensor = function(id,callback){
  redis.drop('sensor.'.concat(id),function(message){
    return callback(message);
  });
};

exports.getAllSensor = function(){
  redis.allkeys('sensor.*',function(keys){
    var n = 0;
    if(keys.length == 0) {
	console.log("0 Sensor");
        return;
    }
    keys.forEach(elem => {
      redis.readObj(elem, function (obj) {
        console.log(obj);
        if(n == (keys.length-1)) process.exit(0);
        else n++;
      });
    });
  });
 };

exports.getAllStartedSensor = function(callback){
  var data = [];
  redis.allkeys('sensor.*',function(keys){
    keys.forEach(elem => {
      redis.readObj(elem, function (obj) {
        if(obj.status == 'started') data.put(obj.elem);
      });
    });
  });
  return callback(data);
 };

 /*exports.putSensorPID = function(id,pid,callback){
  redis.saveObj('sensor.'.concat(id),["pid",pid],function(message){
    return callback(message);
  });
};

 exports.getSensorPID = function(id,callback){
  redis.readObj('sensor.'.concat(id),function(obj){
    return callback(obj.pid);
  });
};*/
