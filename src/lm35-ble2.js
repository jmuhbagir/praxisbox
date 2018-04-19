var five = require("johnny-five");
var BleSerialPort = require('ble-serial').SerialPort;

var bsp = new BleSerialPort({serviceId: 'a082ac000225'}); //put your device name or address here 
var board = new five.Board({port: bsp, repl: false});
       board.on("ready", function() {
           console.log('board ready');
           var temperature = new five.Thermometer({
                controller: "LM35",
                pin: "A0"
           });

           temperature.on("change", function() {
              console.log(this.C + "°C", this.F + "°F");
           });
       });
