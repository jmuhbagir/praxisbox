var redis = require('../storage/redis');

exports.putActuator = function(id,type,ip,boardid,pin,status,callback){
  redis.saveObj('actuator.'.concat(id),["id",id,"type",type,"ip",ip,"boardid",boardid,"pin",pin,"status",status],function(message){
    return callback(message);
  });
};

exports.getActuator = function(id,callback){
 redis.readObj('actuator.'.concat(id),function(obj){
   return callback(obj);
 });
};

exports.putActuatorHealth = function(id,health,callback){
  redis.saveObj('actuator.'.concat(id),["health",health],function(message){
    return callback(message);
  });
};

exports.putActuatorStatus = function(id,status,callback){
  redis.saveObj('actuator.'.concat(id),["status",status],function(message){
    return callback(message);
  });
};

exports.getAllActuator = function(callback){
  redis.allkeys('actuator.*',function(keys){
    var n = 0;
    if(keys.length == 0){
	console.log("0 Actuator");
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

exports.dropActuator = function(id,callback){
  redis.drop('actuator.'.concat(id),function(message){
    return callback(message);
  });
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
