var cmd=require('node-cmd');

exports.init = function(board,callback){
  const process = cmd.get(
        'sudo pio init -d tmp -b '.concat(board),
        function(err, data, stderr){
          if (!err) {
             return callback('Firmware is intialized!');
          } else {
            return callback('error');
          }
        }
    );

    process.stdout.on('data',function(data){
      console.log(data);
    });

    process.stderr.on('data',function(data){
      console.log(data);
    });
};

exports.run = function(board,callback){
  const process = cmd.get(
        'sudo pio run -d tmp -t upload -e '.concat(board),
        function(err, data, stderr){
          if (!err) {
             return callback('Successfully upload firmware!');
          } else {
            return callback('error');
          }
        }
    );

    process.stdout.on('data',function(data){
      console.log(data);
    });

    process.stderr.on('data',function(data){
      console.log(data);
    });
};

exports.list = function(query,callback){
  cmd.get(
        'sudo pio boards '.concat(query),
        function(err, data, stderr){
          if (!err) {
             console.log(data);
          } else {
            console.log(err);
            return callback('error');
          }
        }
    );
};
