var EtherPortClient = require("etherport-client").EtherPortClient;
var mqtt = require('mqtt');
var five = require('johnny-five');
var database = require('./data');

run(process.argv);

function run(args){
 var id = args[2];
 var ip = args[3];
 var pin = args[4];
 var credential = args[5];

  var board = new five.Board({
    port : new EtherPortClient({
      host: ip,
      port: 3030
    }),
    timeout: 10000,
    repl: false
  });

  board.on("connect", function() {
    database.putActuatorStatus(id,"started",function(){});
    console.log("Connected to board %s!",id);
  });


  board.on("fail", function() {
    database.putActuatorStatus(id,"stopped",function(){});
    console.log("Connection failed to board %s!",id);
  });

  board.on('ready', function(){
    var servo = new five.Servo.Continuous(pin);

    var n = 1000;
    var i = 0;
    while(i < n){
      servo.sweep();
      i++;
    }

    this.on("exit", function() {
      console.log('Servo stopped...');
      servo.stop();
      database.putActuatorStatus(id,"stopped",function(){});
    });

  });
};

function loop(servo){
  servo.sweep();
  loop(servo);
};
