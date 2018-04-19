var redis = require('../storage/redis');

exports.run = function(key,x,y){
  switch (key) {
    case "set":
      set(x,y);
      break;
    case "get":
      get(x);
      break;
    default:
      console.log('Please use "set key value" or "get key" command, available (wifi_ssid,wifi_password,wifi_subnet,mqtt_host,mqtt_port,praxis_url)!');
      break;
  }
};

function set(key, value){
  if(key === "wifi_ssid" || key === "wifi_password" || key === "wifi_subnet" || key === "mqtt_host" || key === "mqtt_port" || "praxis_url"){ 
      redis.save(key,value,function(response){
         console.log(response);
      });
    }else{
      console.log('Cannot find configuration key');
    }
};

function get(key){
  if(key === "wifi_ssid" || key === "wifi_password" || key === "wifi_subnet" || key === "mqtt_host" || key === "mqtt_port" || "praxis_url"){ 
      redis.read(key,function(value){
         console.log('%s = %s',key,value);
      });
    }else{
      console.log('Cannot find configuration key');
    }
};
