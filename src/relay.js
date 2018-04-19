var EtherPortClient = require("etherport-client").EtherPortClient;
var five = require("johnny-five");

var board = new five.Board({
    port : new EtherPortClient({
      host: "192.168.0.3",
      port: 3030
    }),
    timeout: 10000,
    repl: true
  });

board.on("ready", function() {
  var relay = new five.Relay(4);
  this.repl.inject({
    relay: relay
  });
});
