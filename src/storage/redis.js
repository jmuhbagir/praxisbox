var redis = require('redis');

exports.save = function(key, value, callback){
  var client = redis.createClient();
  client.on("error", function (err) {
    return callback("Error, cannot connect to storage " + err);
  });
  client.set(key, value, function(err, reply) {
    client.quit();
    return callback("Change saved");
  });
};

exports.saveObj = function(key, value, callback){
  var client = redis.createClient();
  client.on("error", function (err) {
    console.log("Error, cannot connect to storage ");
    return callback(err);
  });
  client.hmset(key, value, function(err, reply) {
    client.quit();
    return callback("Change saved");
  });
};

exports.read = function(key,callback){
  var client = redis.createClient();
  client.on("error", function (err) {
    console.log("Error, cannot connect to storage " + err);
    return;
  });
  client.get(key, function(err, reply) {
    client.quit();
    return callback(reply);
  });
};

exports.drop = function(key,callback){
  var client = redis.createClient();
  client.on("error", function (err) {
    console.log("Error, cannot connect to storage " + err);
    return;
  });
  client.del(key, function(err, reply) {
    client.quit();
    return callback("Deleted");
  });
};

exports.readObj = function(key,callback){
  var client = redis.createClient();
  client.on("error", function (err) {
    console.log("Error, cannot connect to storage " + err);
    return;
  });
  client.hgetall(key, function(err, reply) {
    client.quit();
    return callback(reply);
  });
};

exports.allkeys = function(regex,callback){
  var client = redis.createClient();

  client.on("error", function (err) {
    console.log("Error, cannot connect to storage " + err);
    return;
  });

  client.keys(regex, function (err, keys) {
    client.quit();
    return callback(keys);
  });
};
