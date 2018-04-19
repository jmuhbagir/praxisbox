/*Praxis IoT Gateway Service
*/

var mqtt = require('mqtt');
var redis = require('../storage/redis');
var parser = require('../utils/parser');
var HealthCheck = require('./healthcheck');
var MQTTSender = require('./mqttsender');
var { spawn } = require('child_process');
var processes = new Map();

exports.run = function(key){

  switch (key) {
    case "start":
      start(function(message){
      });
      break;
    default:
      console.log('Usage service start');
      break;
  }
};

function start(callback){
  var cron_health = HealthCheck.runHealthCheck();
  var cron_mqtt = undefined;
  redis.read('mqtt_host',function(value){
    if(value == undefined){
      return callback('Please define your mqtt host in setting');
    }else{
      var host = value;
      redis.read('mqtt_port',function(value){
        if(value==undefined){
          value = '1883';
        }

        var port = value;
        redis.read('credential',function(value){
              if(value==undefined){
                return callback('Please register your device first!');
              }else {

                console.log('Attempting to start the server at %s:%s',host,port);
                var client  = mqtt.connect('mqtt://'+ host,{
                  port: port,
                  username: value
                });

                client.on('connect', function () {
                  console.log('Connected to Server...');
                  cron_health.start();
                  console.log("Starting healthcheck scheduler...");
                  cron_mqtt = MQTTSender.runMQTTSender(client);
                  cron_mqtt.start();
                  console.log("Starting mqttsender scheduler...");
                  console.log('Listening incoming commands...');
                  client.subscribe('v1/devices/me/rpc/request/+');
                });

                client.on('reconnect', function () {
                  console.log('Reconnected to Server...');
                });

                client.on('error',function(error){
                  console.log('Connection error '+error);
                });

                client.on('message', function (topic, message, packet) {
                   parser.parseJSON(message,function(result){
                     console.log(result);
                     if(result.method != undefined){
                       parser.parseJSON(result.params,function(result2){
                        commandHandler(result.method,result2,client,topic);
                      });
                     }
                   });
                });

                process.on('SIGINT', function(){
                  console.log('Exiting all active process...');
                  for(var io of processes.values()){
                    console.log('Gracefully stop process '+io.pid);
                    io.kill('SIGINT');
                  }
                  console.log('Stopping healthcheck...');
                  cron_health.stop();
                  console.log('Stopping mqtt sender...');
                  cron_mqtt.stop();
                  console.log('Exiting service...');
                  client.end();
                });
              }
        });
      });
      }
    });
}

function commandHandler(method,command,client,topic){
  if(method == "sensor" || method == "actuator"){
    switch (command.action) {
      case "start":
        var io = require('../'+method+'/manager');
        io.start(command.id,"false",function(io){
          processes.set(command.id,io);
        });
        client.publish('v1/devices/me/attributes','{"'+command.id+'_status":"start"}');
        break;
      case "stop":
        var io = processes.get(command.id);
        if(io != undefined){
          console.log('Gracefully stop process '+io.pid);
          io.kill('SIGINT');
          processes.delete(command.id);
        }else {
          console.log('Unknow io process');
        }
        client.publish('v1/devices/me/attributes','{"'+command.id+'_status":"stop"}');
        break;
       case "add":
        var io = require('../'+method+'/manager');
        redis.read('list_supported_'+method,function(value){
            if(value.includes(command.type)){
                var setup = io.setupSensor(command,command.configuration);
                setup.on('message',function(data){
                  console.log(data);
                });
            }else{
              console.log("I/O type not found!");
            }
       });
        break;
      case "switch":
        var io = processes.get(command.id);
        if(io != undefined){
          console.log('Gracefully stop process '+io.pid);
          io.kill('SIGINT');
          processes.delete(command.id);
        }else {
          io = require('../'+method+'/manager');
          io.start(command.id,function(io){
            processes.set(command.id,io);
          });
        }
        break;
      default:
        console.log('Unknown action command!');
    }
  }else if(method == "status"){
    getActuatorStatus(command.id,function(status){
      //client.publish(topic.replace('request', 'response'), status, 1)
      console.log(status);
    });
  }else{
    console.log('Unknown command!');
  }
}

function getActuatorStatus(id,callback){
  if(processes.has(id)){
    return callback({id: true});
  }else{
    return callback({id: false});
  }
}
