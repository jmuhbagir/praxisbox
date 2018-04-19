var EtherPortClient = require("etherport-client").EtherPortClient;
var five = require("johnny-five");

var board = new five.Board({
    port : new EtherPortClient({
      host: "192.168.43.2",
      port: 3030
    }),
    timeout: 10000
  });

board.on("ready", function() {
  var led = new five.Led(8);
  this.repl.inject({
    led: led
  });
});
