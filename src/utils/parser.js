exports.parseJSON = function(string,callback) {
  if(Buffer.isBuffer(string)){
    string = string.toString('utf8');
  }

  if(typeof string=='object'){
    return callback(string); 
  }

  return callback(JSON.parse(string));
};
