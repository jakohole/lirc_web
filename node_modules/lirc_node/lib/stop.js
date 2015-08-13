var exec = require('child_process').exec;

exports = module.exports = Stop;

function Stop() {};

Stop = function(){
	return 'sudo /etc/init.d/lirc stop';

};