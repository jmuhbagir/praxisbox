/*Praxis IoT Gateway Service
*/

var prompt = require('prompt');
var parser = require('../utils/parser');
var redis = require('../storage/redis');
var Client = require('node-rest-client').Client;
var client = new Client();

redis.read('praxis_url',function(value){
  if(value==undefined){
    value = 'http://dev.praxis.sml:14000';
  }
  client.registerMethod("login", value.concat("/api/auth/login"), "POST");
  client.registerMethod("logout", value.concat("/api/auth/logout"), "GET");
});

exports.runLogin = function(){
  redis.save('list_supported_sensor',"lm35,photocell",function(reply){});
  redis.save('list_supported_actuator',"servo,relay",function(reply){});

  prompt.message = '';
  console.log('Login to Praxis IoT Gateway');
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

					parser.parseJSON(data,function(result){
            if( response.statusCode == 200 ){
              redis.save('token',result.token,function(reply){});
  						console.log('Status Code %s, Authentication Succeed, Welcome!',response.statusCode);
  					}else{
              console.log('Status Code %s, Authentication Failed',response.statusCode);
  					}
          });
			});
});
};

exports.runLogout = function(){
  redis.read('token',function(token){
    var args = {
      headers: { "Accept": "*/*", "X-Authorization": "Bearer ".concat(token)}
    }
    client.methods.logout(args, function (data, response) {
  	   parser.parseJSON(data,function(result){
         if( result.status == 200){
           console.log('Logout Succeed, Wassalam!');
         }else{
           console.log(result.message);
           console.log('Logout Failed!');
         }
       });
     });
  });
};
