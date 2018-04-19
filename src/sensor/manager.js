var prompt = require('prompt');
var fs = require('fs-extra');
var replace = require('replace');
var iputil = require('../utils/ipgenerator');
var redis = require('../storage/redis');
var pio = require('../device/platformio');
var database = require('./data');
var { spawn } = require('child_process');
var emitter = require('events').EventEmitter;

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
      process.on('SIGINT', function(){
        io.kill("SIGINT");
      });
    });
    break;
    case "support":
    redis.read('list_supported_sensor',function(value){
       console.log(value);
    });
    break;
    case "drop":
    drop(id,function(io){
    });
    break;
    default:
    console.log('Usage add,start,list,drop');
    break;
  }
};

function add(){
  var id,type,boardid,ip = undefined;
  prompt.message = '';
  console.log('Welcome to Praxis IoT Gateway Sensor Manager');
  prompt.start();
  prompt.get([{
    description: 'Choose your sensor type (sudo gateway sensor support)',
    name: 'type',
    required: true,
    conform: function (value) {

      isSensorSupported(value,function(exists) {
        if(!exists){
          console.log("Sensor doesn't included in this version yet, please contact our support");
          process.exit();
        }
      });
      return true;

    }
  }, {
    description: 'Give your sensor an ID',
    name: 'id',
    required: true,
    conform: function (value) {
      // TO BE Checked if ID Exists later
      return true;
    }
  }, {
    description: 'What board your sensor use (find it using ,sudo gateway list board <query>)',
    name: 'board',
    required: true,
    conform: function (value) {
      // TO BE Checked if ID Exists later
      return true;
    }
  },{
    name: 'Please plug your board to Praxis Box usb serialport, enter to continue',
    required: false
  }
], function (err, result) {
   var setup = setupSensor(result);
   setup.on('message',function(data){
        console.log(data);
   });
});
};

function start(id,stdout,callback){
  redis.read('credential',function(value){
    if(value==undefined){
      console.log('Please register your device first!');
    }
    var credential = value;
    database.getSensor(id,function(value){
      if(value == undefined ){
        console.log('Sensor not identified!');
      }else{
        var sensor = value;
        redis.read('mqtt_host',function(value){
          if(value == undefined){
            console.log('Please define your mqtt host in setting');
          }else{
            var host = value;
            redis.read('mqtt_port',function(value){
              if(value==undefined){
                value = '1883';
              }

              var io = spawn('node',
                    ['./sensor/'.concat(sensor.type).concat('.js'),sensor.id,sensor.ip,sensor.pin,sensor.frequency,stdout]
                );


              io.stdout.on('data',function(data){
                  console.log(data.toString());
              });

              io.stderr.on('data',function(data){
                  console.log(data.toString());
              });

              io.on('close', (code) => {
                database.putSensorStatus(id,"stopped",function(){});
                console.log('Exiting '+sensor.id);
              });
              //io.run(sensor.id,sensor.ip,sensor.pin,sensor.frequency,host,value,credential,function(board){
              //    return callback(board);
              //})

              return callback(io);
            });
          }
        });
      }
    });
  });
};

function setupSensor(result,config){
  var e = new emitter();
  id = result.id;
  type = result.type;
  boardid = result.board;
  //Step 1 create tmp dir under root project
  if (!fs.existsSync('tmp')){
    fs.mkdirSync('tmp');
  }
  //Step 2 Intialize new firmware project
  pio.init(result.board,function(data){
    //console.log(data);
    e.emit('message',data);
    //Step 3 Copy firmata and change values
    fs.copySync('firmata/wifi','tmp/src');
    iputil.getIP(function(ipval){
      replace({regex: "IPADDRESSCHANGEME",replacement: ipval.ip.replace(/\./g,","),paths: ['tmp/src/wifiConfig.h'],silent: true});
      replace({regex: "NETMASKCHANGEME",replacement: ipval.netmask.replace(/\./g,","),paths: ['tmp/src/wifiConfig.h'],silent: true});
      replace({regex: "GATEWAYCHANGEME",replacement: ipval.gateway.replace(/\./g,","),paths: ['tmp/src/wifiConfig.h'],silent: true});
      ip = ipval.ip;
    });

    redis.read('wifi_ssid',function(value){
      if(value == undefined){
        e.emit('message','Please set your wifi ssid first (gateway set wifi_ssid <ssid>)');
      }

      replace({regex: "SSIDCHANGEME",replacement: value,paths: ['tmp/src/wifiConfig.h'],silent: true});
    });
    redis.read('wifi_password',function(value){
      if(value == undefined){
        e.emit('message','Your network not secure set password first (gateway set wifi_password <ssid>)');
      }

      replace({regex: "SSIDPASSCHANGEME",replacement: value,paths: ['tmp/src/wifiConfig.h'],silent: true});
    });
    //Step 4 Run Upload firmware
    pio.run(boardid,function(data){
      if(data != 'error' && config == undefined){
        e.emit('message',data);
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
        }, {
          description: 'Frequency of Data (milis)',
          name: 'frequency',
          required: true
        }
      ], function (err, result) {
        database.putSensor(id,type,ip,boardid,result.pin,result.frequency,"stopped",function(message){
          e.emit('message',"Done!, Please start sensor using, (gateway sensor start id)");
        });
      }
    );
  }else if (data != 'error' && config != undefined) {
      database.putSensor(id,type,ip,boardid,config.pin,config.frequency,"stopped",function(message){
         e.emit('message',"Done!, Please start sensor using, (gateway sensor start id)");
      })
  }else{
    e.emit('message','Failed to Upload Firmata Firmware');
  }
});
});

 return e;
};

function isSensorSupported(sensor,callback){
  redis.read('list_supported_sensor',function(value){
    return callback(value.includes(sensor));
  });
};

function list(){
  database.getAllSensor();
};

function drop(id){
  database.dropSensor(id,function(message){
    console.log(message);
  });
};

exports.start = start;
exports.setupSensor = setupSensor;
