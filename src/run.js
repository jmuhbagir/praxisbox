var auth = require('./auth/authentication');
var list = require('./device/list');
var register = require('./device/register');
var attribute = require('./device/attribute');
var setting = require('./config/setting');
var sensor = require('./sensor/manager');
var actuator = require('./actuator/manager');
var service = require('./service/server');

var args = process.argv;
var length = args.length;

if(length < 3){
  console.log('Usage : gateway.sh <login, service, list, register, sensor, actuator, attribute,logout, config, help>');
}else{
  switch(args[2]){
    case "login":
      auth.runLogin();
      break;
    case "service":
      service.run(args[3]);
      break;
    case "logout":
      auth.runLogout();
      break;
    case "list":
      list.run(args[3],args[4]);
      break;
    case "register":
      register.run();
      break;
    case "config":
      setting.run(args[3],args[4],args[5]);
      break;
    case "sensor":
      sensor.run(args[3],args[4]);
      break;
    case "actuator":
      actuator.run(args[3],args[4]);
      break;
    case "attribute":
      attribute.run(args[3]);
      break;
    default:
      console.log('Usage : gateway.sh <login, list, register, sensor, actuator, attribute, logout, config, help>');
  }
}
