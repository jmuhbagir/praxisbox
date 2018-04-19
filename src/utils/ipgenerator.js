var redis = require('../storage/redis');
var Netmask = require('netmask').Netmask;

exports.getIP = function(callback){
 var ipsensor = undefined;
 var ips = [];
 IOIPs(function(io_ip){
   ips.push(io_ip);
    SubnetIPs(function(ip,first,mask){
      var found = false;
      for(var i = 0; i<ips.length; i++){
        if(ips[i] == ip) {
           found = true;
           break;
        }
      }

     if(!found && ipsensor == undefined && ip != first){
      ipsensor = {};
      ipsensor['ip'] = ip;
      ipsensor['netmask'] = mask;
      ipsensor['gateway'] = first
      return callback(ipsensor);
     }
    });
   });
}

function SubnetIPs(callback){
   redis.read('wifi_subnet',function(value){
   if(value==undefined){
      console.log('Please set your router ip subnet first!');
      throw err;
   }
   var block = new Netmask(value);
   block.forEach(function(ip, long, index){
      return callback(ip,block.first,block.mask);
   });
 });
}

function IOIPs(callback){
      redis.allkeys('*.*',function(keys){
         if(keys.length == 0){
          keys.push("dummy");
        }

        keys.forEach(elem => {
          redis.readObj(elem, function (io) {
            if(io === null){
                io = {ip: "127.0.0.1"}
            }
            return callback(io.ip);
          });
        });
      });
}
