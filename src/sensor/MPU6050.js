var EtherPortClient = require("etherport-client").EtherPortClient;
var mqtt = require('mqtt');
var five = require('johnny-five');
var database = require('./data');

run(process.argv);

function run(args){
  console.log(args);
  var id = args[2];
  var ip = args[3];
  var pin = args[4];
  var frequency = args[5];
  var host = args[6];
  var port = args[7];
  var credential = args[8];
  var count = 0;

  var board = new five.Board({
    port : new EtherPortClient({
      host: ip,
      port: 3030
    }),
    timeout: 10000,
    repl: false
  });

  board.on("connect", function() {
    database.putSensorStatus(id,"started",function(){});
    console.log("Connected to board %s!",id);
  });


  board.on("fail", function() {
    database.putSensorStatus(id,"stopped",function(){});
    console.log("Connection failed to board %s!",id);
  });

  board.on('ready', function(){
    var accel = new five.Accelerometer({
      controller: "MPU6050"
    });

    var client  = mqtt.connect('mqtt://'+ host,{
      port: port,
      username: credential
    });

    client.on('connect', function () {
      accel.on("acceleration", function(data) {
        count ++;

        if(count==(frequency/1000)){
          payload = "{\"acceleration\":".concat(data).concat("}");
          client.publish('v1/devices/me/telemetry', payload);
          count=0;
        }
      });
    });

    client.on('error',function(error){
      console.log('Connection error '+error);
    });

    this.on("exit", function() {
      console.log('Exiting MPU6050 Process...');
      database.putSensorStatus(id,"stopped",function(){});
      accel.disable();
      client.end();
    });
  });
};
