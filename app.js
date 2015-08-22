// lirc_web - v0.0.8
// Alex Bain <alex@alexba.in>

// Requirements
var express = require('express'),
    lirc_node = require('lirc_node'),
    consolidate = require('consolidate'),
    path = require('path'),
    swig = require('swig'),
    labels = require('./lib/labels');
    fs = require ('fs');
    CombinedStream = require('combined-stream');
    

// Precompile template
var JST = {
    index: swig.compileFile(__dirname + '/templates/index.swig'),
    exist: swig.compileFile(__dirname + '/templates/exist.swig'),
    status: swig.compileFile(__dirname + '/templates/status.swig'),
    status2: swig.compileFile(__dirname + '/templates/status2.swig'),
    schedule: swig.compileFile(__dirname + '/templates/schedule.swig'),
    teach: swig.compileFile(__dirname + '/templates/teach.swig'),
    auto: swig.compileFile(__dirname + '/templates/auto.swig'),
    manual: swig.compileFile(__dirname + '/templates/manual.swig')
};

// Create app
var app = module.exports = express();

var cp = require('child_process');
var pstree = require('ps-tree');
//var exec = cp.exec;
//var spawn = require('child_process').spawn;
//var execSync = require('child_process').execSync;

/*swig.init({
    root: VIEWS_DIR, //Note this directory is your Views directory
    allowErrors: true // allows errors to be thrown and caught by express
});*/

// App configuration
app.engine('.html', consolidate.swig);
app.configure(function() {
    app.use(express.logger());
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.compress());
    app.use(express.static(__dirname + '/static'));
});

// lirc_web configuration
var config = {};

// Based on node environment, initialize connection to lirc_node or use test data
if (process.env.NODE_ENV == 'test' || process.env.NODE_ENV == 'development') {
    lirc_node.remotes = require(__dirname + '/test/fixtures/remotes.json');
    config = require(__dirname + '/test/fixtures/config.json');
} else {
    lirc_node.init();

    // Config file is optional
    try {
        config = require(__dirname + '/config.json');
    } catch(e) {
        console.log("DEBUG:", e);
        console.log("WARNING: Cannot find config.json!");
    }
}


// Routes

var labelFor = labels(config.remoteLabels, config.commandLabels)
var lircdpath = '';
//var first = True;
// Web UI
app.get('/', function(req, res) {
    res.send(JST['index'].render({
        remotes: lirc_node.remotes,
        macros: config.macros,
        repeaters: config.repeaters,
        labelForRemote: labelFor.remote,
        labelForCommand: labelFor.command
    }));
});

app.get('/manual', function(req, res) {
    res.send(JST['manual'].render({
        remotes: lirc_node.remotes,
        macros: config.macros,
        repeaters: config.repeaters,
        labelForRemote: labelFor.remote,
        labelForCommand: labelFor.command
    }));
});

app.get('/status2', function(req, res) {
    res.send(JST['status2'].render({
        remotes: lirc_node.remotes,
        macros: config.macros,
        repeaters: config.repeaters,
        labelForRemote: labelFor.remote,
        labelForCommand: labelFor.command
    }));
});

app.get('/schedule', function(req, res) {
    res.send(JST['schedule'].render({
        remotes: lirc_node.remotes,
        macros: config.macros,
        repeaters: config.repeaters,
        labelForRemote: labelFor.remote,
        labelForCommand: labelFor.command
    }));
});

app.get('/teach', function(req, res) {
    res.send(JST['teach'].render({
        labelForCommand: labelFor.command
    }));
    cp.exec('cp /etc/lirc/lircdhead.conf /etc/lirc/lircdaircon.conf', function (req,res) {});

    lircdpath = "/etc/lirc/lircdaircon.conf";
    combinedstream = CombinedStream.create();

});

app.get('/auto', function(req, res) {
    res.send(JST['auto'].render({
        remotes: lirc_node.remotes,
        macros: config.macros,
        repeaters: config.repeaters,
        labelForRemote: labelFor.remote,
        labelForCommand: labelFor.command
    }));
});

/*app.get('/', function(req.res) {
    res.send()*/

// List all remotes in JSON format
app.get('/remotes.json', function(req, res) {
    res.json(lirc_node.remotes);
});

// List all commands for :remote in JSON format
app.get('/remotes/:remote.json', function(req, res) {
    if (lirc_node.remotes[req.params.remote]) {
        res.json(lirc_node.remotes[req.params.remote]);
    } else {
        res.send(404);
    }
});

// List all macros in JSON format
app.get('/macros.json', function(req, res) {
    res.json(config.macros);
});

// List all commands for :macro in JSON format
app.get('/macros/:macro.json', function(req, res) {
    if (config.macros && config.macros[req.params.macro]) {
        res.json(config.macros[req.params.macro]);
    } else {
        res.send(404);
    }
});

//app.get('/mode2/:outfile.json', function(req,res){
//   res.json(mode2.outfile);
//});
var outfiles = {};
var mode2child;
/*app.get('/config/:remote', function(req,res){

    //var remotename = req.param("remote");

    //obj = JSON.parse( json );
    //obj.commandLabels.

});*/
//app.post('/mode2/:outfile', function(req,res){
// console.log(req.param("outfile"));
//});

var outfile;
var outfiles='';
var count = 0;
var lircfile;

function getData(filename,dat){

  fs.readFile(filename, function(err, dat) { // read file to memory
      if (!err) {
        dat = dat.toString(); // stringify buffer
        var position = dat.toString().indexOf('\n'); // find position of new line element
        if (position != -1) { // if new line element found
            dat = dat.substr(position); // subtract string based on first line length

            fs.writeFile(filename, dat, function(err) { // write file
                if (err) { // if error, report
                    //console.log (err);
                }
            });
         console.log(dat);
         //console.log(lircdpath);
        } else {
            console.log('no lines found');
        }
      } else {
         console.log(err);
        }
    });
  return dat;
}

app.get('/mode2/:outfile', function(req,res){
     
  outfile = req.param("outfile");
  //outfiles[count] = outfile.toString();  
  //console.log (remote);
  console.log(outfile);   


  var data;
  var tail = '/etc/lirc/lircdtail.conf';
  if (outfile == "COMMIT"){

    console.log(getData(tail,data));
    
    fs.appendFile (lircdpath, getData(tail,data), function (err){
     if(err) {console.log(err);}
    }); 
  }
  else if (outfile == "END"){
    pstree(mode2child.pid, function (err,children) {
      cp.spawn('kill', ['-9'].concat(children.map(function (p) {return p.PID})))
     }); 


    var filePath = outfiles; // path to file
    console.log(filePath);

    // Skip the 1st line 
    fs.readFile(filePath, function(err, data) { // read file to memory
      if (!err) {
        data = data.toString(); // stringify buffer
        var position = data.toString().indexOf('\n'); // find position of new line element
        if (position != -1) { // if new line element found
            data = data.substr(position + 1); // subtract string based on first line length

            fs.writeFile(filePath, data, function(err) { // write file
                if (err) { // if error, report
                    //console.log (err);
                }
            });
         console.log(data);
         console.log(lircdpath);
        } else {
            console.log('no lines found');
        }
      } else {
        console.log('test', err);
        }
    });
     console.log(lircdpath);

     combinedstream.append(function(next) {
       next(fs.createReadStream('lircdpath'));
     });

     /*fs.appendFile(lircdpath,data, function(err) {
       if(err) { console.log(err);}
       else{
          console.log(getData(lircdpath,data)); 
         
       }
     });*/

  } 
  else{
    outfiles = outfile.toString();
    var mode2command = "sudo mode2 -d /dev/lirc0 -m > " + outfile;
   
    cp.exec("sudo /etc/init.d/lirc stop", function(error, stdout, stderr) {
      if(error) {}
       //res.send("Error stopping LIRC");
      else {}
       //res.send("Success");
    });
   
   /*exec(mode2command, {timeout: 1000, maxBUffer: 200*1024, killSignal: 'SIGKILL', cwd: null, env:null},function(err, stdout, stderr){
      console.log('stdout: ' +stdout);
      console.log('stderr: ' + stderr);
      if (err != null) {
        console.log('exec error: '+ err);
      }  

    });*/

  mode2child =  cp.exec(mode2command, function(error, stdout, stderr){
      if(error){
        res.send("Error sending "+ mode2command);

      }else {
        console.log("Successfully sent mode2 > "+outfile);
       }
    });
 }
});
    


    /*
    var filePath = './'+outfile;

    fs.readFile(filePath, function(err, data) { // read file to memory
      if (!err) {
        data = data.toString(); // stringify buffer
        var position = data.toString().indexOf('\n'); // find position of new line element
        if (position != -1) { // if new line element found
            data = data.substr(position + 1); // subtract string based on first line length

            fs.writeFile(filePath, data, function(err) { // write file
                if (err) { // if error, report
                    console.log (err);
                }
            });
        } else {
            console.log('no lines found');
        }
      } else {
          console.log(err);
        }
    });
 
    res.send(data);
    */
    //execSync (mode2command, SIGTERM);
    //execSync ('sudo vim power');
/*    
    var readline = require('readline');
    var stream = require('stream');

    var instream = fs.createReadStream('outfile');
    var outstream = new stream;
    var rl = readline.createInterface(instream, outstream);

    rl.on('line', function(line) {
    // process line here
    });

    rl.on('close', function() {
    // do something on finish here
    }); 

    res.send(JST['teach'].render({
      commandline: mode2command
    }));

    
    if (process.platform === "win32") {
         var rl = require("readline").createInterface({
         input: process.stdin,
         output: process.stdout
       });

      rl.on("SIGINT", function () {
        process.emit("SIGINT");
      });
    }  

    process.on("SIGINT", function () {
      //graceful shutdown
      process.exit();
    });
    
  }    

  return true;
*/



/*app.post('/out/:outfile ',function(req,res){

  lirc_node.mode2.out(req.params.outfile, function() {});
  res.setHeader('Cache-Control', 'no-cache');
  res.send(200);
});*/


// Send :remote/:command one time
app.post('/remotes/:remote/:command', function(req, res) {

    console.log(req.params.remote);
    console.log(req.params.command);

    lirc_node.irsend.send_once(req.params.remote, req.params.command, function() {});
    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);

});

// Start sending :remote/:command repeatedly
app.post('/remotes/:remote/:command/send_start', function(req, res) {
    lirc_node.irsend.send_start(req.params.remote, req.params.command, function() {});
    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);
});

// Stop sending :remote/:command repeatedly
app.post('/remotes/:remote/:command/send_stop', function(req, res) {
    lirc_node.irsend.send_stop(req.params.remote, req.params.command, function() {});
    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);
});

// Execute a macro (a collection of commands to one or more remotes)
app.post('/macros/:macro', function(req, res) {

    // If the macro exists, execute each command in the macro with 100msec
    // delay between each command.
    if (config.macros && config.macros[req.params.macro]) {
        var i = 0;

        var nextCommand = function() {
            var command = config.macros[req.params.macro][i];

    	    if (!command) { return true; }

            // increment
            i = i + 1;

            if (command[0] == "delay") {
                setTimeout(nextCommand, command[1]);
            } else {
                // By default, wait 100msec before calling next command
                lirc_node.irsend.send_once(command[0], command[1], function() { setTimeout(nextCommand, 100); });
            }
        };

        // kick off macro w/ first command
        nextCommand();
    }

    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);
});


// Default port is 3000
app.listen(3000);
console.log("Open Source Universal Remote UI + API has started on port 3000.");
