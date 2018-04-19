var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://demo.praxis.id',{
    username: "1O3A1duTrjKHSXJx00z0"
});

client.on('connect', function () {
    console.log('connected');
    client.subscribe('v1/devices/me/rpc/request/+')
});

client.on('message', function (topic, message) {
    console.log('request.topic: ' + topic);
    console.log('request.body: ' + message.toString());
});
