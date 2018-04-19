var BLESerialPort = require('ble-serial').SerialPort;
var five = require('johnny-five');

//use the virtual serial port to send a command to a firmata device
var bleSerial = new BLESerialPort({serviceId: '19b10000-e8f2-537e-4f6c-d104768a1214'});
var board = new five.Board({port: bleSerial, repl: false});
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
