var five = require('johnny-five'); var EtherPortClient = require("etherport-client").EtherPortClient; var board = new 
five.Board({
  port : new EtherPortClient({
    host: "192.168.43.4",
    port: 3030
  }),
  timeout: 10000,
  repl: false
});
board.on("ready", function() {
  var accel = new five.Accelerometer({
    controller: "MPU6050",
    sensitivity: 16384 // optional
  });
  // Accelerometer Event API
  // "acceleration"
  //
  // Fires once every N ms, equal to value of freg
  // Defaults to 500ms
  //
  accel.on("acceleration", function(data) {
    console.log("acceleration", data);
  });
  // "orientation"
  //
  // Fires when orientation changes
  //
  accel.on("orientation", function(data) {
    console.log("orientation", data);
  });
  // "inclination"
  //
  // Fires when inclination changes
  //
  accel.on("inclination", function(data) {
    console.log("inclination", data);
  });
  // "change"
  //
  // Fires when X, Y or Z has changed
  //
  accel.on("change", function(data) {
    console.log("change", data);
  });
});
