var EtherPortClient = require("etherport-client").EtherPortClient;
var five = require("johnny-five");

var board = new five.Board({
    port : new EtherPortClient({
      host: "192.168.43.2",
      port: 3030
    }),
    timeout: 10000,
    repl: false
  });

board.on("ready", function() {
  this.pinMode(10, five.Pin.OUTPUT);
  this.digitalWrite(10,1);
  this.pinMode(10, five.Pin.INPUT);
  this.digitalRead(10, function(value) {
    console.log(value);
  });
});
