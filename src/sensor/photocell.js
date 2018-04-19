var EtherPortClient = require("etherport-client").EtherPortClient;
var five = require('johnny-five');
var database = require('./data');

run(process.argv);

function run(args){
  var id = args[2];
  var ip = args[3];
  var pin = args[4];
  var frequency = args[5];
  var stdout = args[6];

  var board = new five.Board({
    port : new EtherPortClient({
      host: ip,
      port: 3030
    }),
    timeout: 10000,
    repl: false
  });

  board.on('ready', function(){
    console.log("Connected Photocell");
    database.putSensorStatus(id,"started",function(){});

    var light = new five.Light({
      pin: pin,
      freq: frequency
    });

    light.on("data", function() {
       database.putSensorPayload(id,this.level,function(){}); 
       if(stdout == "true") {
          console.log('{ '+id+' : '+this.level+'}');
       }
    });
  });
};
