var EtherPortClient = require("etherport-client").EtherPortClient;
var five = require("johnny-five");

        var board = new five.Board({
           port : new EtherPortClient({
                  host: "192.168.0.4",
                  port: 3030
           }),
           repl: false
        });

        board.on("ready", function() {
           var light = new five.Light({
             pin: "A0",
             freq: 20000
           });

           light.on("change", function() {
              console.log(this.level);
           });
        });
