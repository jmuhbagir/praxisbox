var EtherPortClient = require("etherport-client").EtherPortClient;
var mqtt = require('mqtt');
var five = require('johnny-five');
var database = require('./data');

run(process.argv);

function run(args){
 var id = args[2];
 var ip = args[3];
 var pin = args[4];
 var stdout = args[5];

  var board = new five.Board({
    port : new EtherPortClient({
      host: ip,
      port: 3030
    }),
    timeout: 10000,
    repl: false
  });

  board.on('ready', function(){
    database.putActuatorStatus(id,"started",function(){});
    console.log("Connected to board %s!",id);
    var relay = new five.Relay({
      pin: pin,
      type: "NC"
    });

    relay.open();
    this.on("exit", function() {
      console.log('Relay stopped...');
      relay.close();
      database.putActuatorStatus(id,"stopped",function(){});
    });

  });
};
