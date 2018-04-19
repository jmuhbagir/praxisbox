const bluetooth = require('node-bluetooth');

// create bluetooth device instance
const device = new bluetooth.DeviceINQ();

var list = [];

device
.on('finished',  console.log.bind(console, 'finished'))
.on('found', function found(address, name){

  if(name == "aliviobt01") {
  console.log('Found: ' + address + ' with name ' + name);

  // find serial port channel
  device.findSerialPortChannel(address, function(channel){
    console.log('Found RFCOMM channel for serial port on %s : %s', name, channel);

    // make bluetooth connect to remote device
    bluetooth.connect(address, channel, function(err, connection){
      if(err) return console.error(err);

      console.log(connection);

      connection.delimiter = Buffer.from('\n', 'utf8');
      connection.on('data', (buffer) => {
        console.log('received message:', buffer.toString());
      });

      connection.write(new Buffer('Hello!', 'utf-8'), () => {
        console.log('wrote');
      });
    });
  });
 }

}).inquire();
