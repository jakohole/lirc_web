var exec = require('child_process').exec;

exports = module.exports = Mode2;

function Mode2 () {};

//prototype


Mode2.prototype.out = function(outfile, callback){
	var command = this._raw(outfile);
	return exec(command, callback);
}

//Internal methods
Mode2.prototype._out = function(outfile){
	if(!outfile) outfile = '';

	return 'sudo mode2 -d /dev/lirc0 -m > ' + outfile; 
};