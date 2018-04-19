/*
 * Update line 18 below to the ESP8266 board address
 *
 * Enable Serial debugging by uncommenting //#defin SERIAL_DEBUG in StandardFirmataWiFi
 * (save a copy of StandardFirmataWiFi first)
 *
 * On startup (you may have to reset the ESP board because it starts up really fast
 * view the Serial output to see the assigned IP address (if using DHCP)
 * Or if you want to give the board a static IP (not use DHCP) then uncomment the
 * following lines in wifiConfig.h and update to your chosen IP address:
 * #define STATIC_IP_ADDRESS  10,0,0,17
 * #define SUBNET_MASK        255,255,255,0 // REQUIRED for ESP8266_WIFI, ignored for others
 * #define GATEWAY_IP_ADDRESS 0,0,0,0       // REQUIRED for ESP8266_WIFI, ignored for others
 */
var five = require("johnny-five");
var EtherPortClient = require("etherport-client").EtherPortClient;
var board = new five.Board({
  port: new EtherPortClient({
     host: "192.168.43.3",
     port: 3030
  }),
  timeout: 10000,
  repl: false
});

//var board = new five.Board();

board.on("connect", function(){
  console.log('CONNECTED!');
});

board.on("message", function(event){
   console.log(event);
});

board.on("ready", function() {
  console.log("READY!");
  var servo = new five.Servo.Continuous(0);
  
  var i=1000;
  var n = 0;
  while(n < i){
    servo.sweep();
    n++;
  }
});

