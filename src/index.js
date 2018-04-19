/**
 * Praxis IoT Gateway Service
 */

var prompt = require('prompt');
var program = require('commander');
var parser = require('./utils/parser');
var Client = require('node-rest-client').Client;

var client = new Client();
client.registerMethod("login", "http://demo.praxis.id:14000/api/auth/login", "POST");
client.registerMethod("getDevice", "http://demo.praxis.id:14000/api/tenant/devices", "GET");

prompt.message = '';
console.log('Login to Praxis IoT Gateway:');
prompt.start();
prompt.get([{
      name: 'username',
      required: true
    }, {
      name: 'password',
      hidden: true,
      conform: function (value) {
        return true;
      }
		}
    ], function (err, result) {

			var args = {
    		data: { username: result.username, password: result.password },
    		headers: { "Content-Type": "application/json" }
			};

			client.methods.login(args, function (data, response) {

					data = parser.parseJSON(data);

			    if( data.token == null ){
						console.log('Status Code %s, Authentication Failed',response.statusCode);
					}else{
						console.log('Status Code %s, Authentication Succeed, Welcome!',response.statusCode);

						prompt.get([
							{description: 'Enter your device name : ', name: 'device', required: true}
						], function (err, result){
							var args = {
								data : { deviceName: result.device },
								headers: { "Accept": "*/*", "X-Authorization": "Bearer ".concat(data.token)}
							}

							client.methods.getDevice(args, function(data, response){
								device = parser.parseJSON(data);
								console.log(data);
								console.log(response.statusCode);
							});
						});
					}
			});
});
