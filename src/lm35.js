//var EtherPortClient = require("etherport-client").EtherPortClient;
var five = require("johnny-five");


var board = new five.Board({
        //port : new EtherPortClient({
           //host: "192.168.43.3",
           //port: 3030
        //}),
        port: "/dev/rfcomm0"
            //timeout: 10000,
            //repl: false
        });

        board.on("ready", function() {
           var temperature = new five.Thermometer({
                controller: "LM35",
                pin: "A0"
           });

           temperature.on("change", function() {
              console.log(this.C + "°C", this.F + "°F");
           });
});
