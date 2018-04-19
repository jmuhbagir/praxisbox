var EtherPortClient = require("etherport-client").EtherPortClient;
var five = require("johnny-five");

var board = new five.Board({
    port : new EtherPortClient({
      host: "192.168.43.2",
      port: 3030
    }),
    timeout: 10000,
    repl: true
  });

board.on("ready", function() {
  var mic = new five.Sensor("A0");
  mic.on("data", function() {
    console.log(mic.value);
  });
});
