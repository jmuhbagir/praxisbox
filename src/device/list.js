var parser = require('../utils/parser');
var redis = require('../storage/redis');
var pio = require('../device/platformio');
var Client = require('node-rest-client').Client;
var client = new Client();

exports.run = function(key,query){
  redis.read('praxis_url',function(value){
    if(value==undefined){
      value = 'http://dev.praxis.sml:14000';
    }
    client.registerMethod("listCustomer", value.concat("/api/customers?limit=100"), "GET");
    client.registerMethod("listDashboard", value.concat("/api/tenant/dashboards?limit=100"), "GET");
    client.registerMethod("listDevice", value.concat("/api/tenant/devices?limit=100"), "GET");

  });
  switch(key){
    case "customer":
      customer();
      break;
    case "device":
      device();
      break;
    case "dashboard":
      dashboard();
      break;
    case "board":
      board(query);
      break;
    default:
      console.log('list keys are customer,device,dashboard,board <query>');
  }
};

function customer(){
  redis.read('token',function(token){
    var args = {
      headers: { "Accept": "*/*", "X-Authorization": "Bearer ".concat(token)}
    }

    client.methods.listCustomer(args, function(data, response){
      parser.parseJSON(data,function(result){
        console.log(result);
      });
    });
  });
};

function device(){
  redis.read('token',function(token){
    var args = {
      headers: { "Accept": "*/*", "X-Authorization": "Bearer ".concat(token)}
    }

    client.methods.listDevice(args, function(data, response){
      parser.parseJSON(data,function(result){
        if (result.data == null){
          console.log(result);
        }else {
          for(dev in result.data){
            console.log("no %d",dev);
            console.log("Device ID : ",result.data[dev].id);
            console.log("Device Name : ",result.data[dev].name);
          }
        }
      });
    });
  });
};

function dashboard(){
  redis.read('token',function(token){
    var args = {
      headers: { "Accept": "*/*", "X-Authorization": "Bearer ".concat(token)}
    }

    client.methods.listDashboard(args, function(data, response){
      parser.parseJSON(data,function(result){
        console.log(result);
      });
    });
  });
};

function board(query){
  pio.list(query);
}
