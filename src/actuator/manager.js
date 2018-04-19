//var lm35 = require('lm35');
var prompt = require('prompt');
var iputil = require('../utils/ipgenerator');
var fs = require('fs-extra');
var replace = require('replace');
var redis = require('../storage/redis');
var pio = require('../device/platformio');
var database = require('./data');
var { spawn } = require('child_process');

exports.run = function(key,id){
  switch (key) {
    case "add":
      add();
      break;
    case "list":
      list();
      break;
    case "start":
      start(id,"true",function(io){
      });
      break;
    case "drop":
      drop(id,function(io){
      });
      break;
    case "support":
    redis.read('list_supported_actuator',function(value){
      console.log(value);
    });
    break;
    default:
      console.log('Usage add,list,start');
  }
};

function add(){
  var id,type,boardid,ip = undefined;
  prompt.message = '';
  console.log('Welcome to Praxis IoT Gateway Actuator Manager');
  prompt.start();
  prompt.get([{
        description: 'Choose your actuator type (node run.js list actuator)',
        name: 'type',
        required: true,
        conform: function (value) {

          isActuatorSupported(value,function(exists) {
            if(!exists){
              console.log("Actuator doesn't included in this version yet, please contact our support");
              process.exit();
            }
          });
          return true;

        }
      }, {
        description: 'Give your actuator an ID',
        name: 'id',
        required: true,
        conform: function (value) {
          // TO BE Checked if ID Exists later
          return true;
        }
  		}, {
        description: 'What board your actuator use (find it using ,node run.js list-board <query>)',
        name: 'board',
        required: true,
        conform: function (value) {
          // TO BE Checked if ID Exists later
          return true;
        }
  		},{
        name: 'Please plug your board to usb serialport, enter to continue',
        required: false
  		}
      ], function (err, result) {
        id = result.id;
        type = result.type;
        boardid = result.board;
        //Step 1 create tmp dir under root project
        if (!fs.existsSync('tmp')){
          fs.mkdirSync('tmp');
        }
        //Step 2 Intialize new firmware project
        pio.init(result.board,function(data){
          console.log(data);
          //Step 3 Copy firmata and change values
          fs.copySync('firmata','tmp/src');
          iputil.getIP(function(ipval){
            replace({regex: "IPADDRESSCHANGEME",replacement: ipval.ip.replace(/\./g,","),paths: ['tmp/src/wifiConfig.h'],silent: true});
            replace({regex: "NETMASKCHANGEME",replacement: ipval.netmask.replace(/\./g,","),paths: ['tmp/src/wifiConfig.h'],silent: true});
            replace({regex: "GATEWAYCHANGEME",replacement: ipval.gateway.replace(/\./g,","),paths: ['tmp/src/wifiConfig.h'],silent: true});
            ip = ipval.ip;
          });

          redis.read('wifi_ssid',function(value){
            if(value == undefined){
              console.log('Please set your wifi ssid first (using node run.js set wifi_ssid <ssid>)');
              throw err;
            }

            replace({regex: "SSIDCHANGEME",replacement: value,paths: ['tmp/src/wifiConfig.h'],silent: true});
          });
          redis.read('wifi_password',function(value){
            if(value == undefined){
              console.log('Your network not secure set password first (using node run.js set wifi_password <ssid>)');
              throw err;
            }

            replace({regex: "SSIDPASSCHANGEME",replacement: value,paths: ['tmp/src/wifiConfig.h'],silent: true});
          });
          //Step 4 Run Upload firmware
          pio.run(result.board,function(data){
            if(data != 'error'){
              console.log(data);
              //Step 5 Finish it!
              prompt.message = '';
              prompt.start();
              prompt.get([{
                    description: 'Analog/PWM/GPIO Pin',
                    name: 'pin',
                    required: true,
                    conform: function (value) {
                      // TO BE Checked if Pin Exists later
                      return true;
                    }
                  }
                  ], function (err, result) {
                    database.putActuator(id,type,ip,boardid,result.pin,"stopped",function(message){
                      console.log(message);
                      console.log("Done, Please start actuator using, (gateway actuator start id)");
                    });
                  }
                );
            }else{
              console.log('Failed to Upload Firmata Firmware');
              throw err;
            }
          });
        });
      });
};

function start(id,stdout,callback){
  redis.read('credential',function(value){
    if(value==undefined){
      console.log('Please register your device first!');
    }
    var credential = value;
    database.getActuator(id,function(value){
      if(value == undefined ){
        console.log('Actuator not identified!');
      }else{
        var actuator = value;
        var io = spawn('node',
              ['./actuator/'.concat(actuator.type).concat('.js'),actuator.id,actuator.ip,actuator.pin,credential,stdout]
          );


        io.stdout.on('data',function(data){
            console.log(data.toString());
        });

        io.stderr.on('data',function(data){
            console.log(data.toString());
        });

        io.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
        });

        return callback(io);
      }
    });
  });
};

function isActuatorSupported(actuator,callback){
  redis.read('list_supported_actuator',function(value){  
     return callback(value.includes(actuator));
  });
};

function list(){
  database.getAllActuator();
};

function drop(id){
  database.dropActuator(id,function(message){
    console.log(message);
  });
};

exports.start = start;
