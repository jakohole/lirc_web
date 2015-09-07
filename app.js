// lirc_web - v0.0.8
// Originated by Alex Bain <alex@alexba.in>

// Mode2, Scheduling features by Nat Tangpanichayanont <tnut@hotmail.com>

// Requirements
var express = require('express'),
    lirc_node = require('lirc_node'),
    consolidate = require('consolidate'),
    path = require('path'),
    swig = require('swig'),
    labels = require('./lib/labels'),
    fs = require ('fs'),
    CombinedStream = require('combined-stream'),
    jsonfile = require('jsonfile'),
    bodyParser = require('body-parser'), 
    Cronjob = require('cron').CronJob,  
    MultiStream = require('multistream'),
    Promise = require('promise'),
    Crontab = require('crontab'),
    schedule = require('node-schedule');
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

//db
var orientjs = require('orientjs');

var server = orientjs({
    host: '192.168.43.14',
    port: 2424,
    username: 'root',
    password: 'admin'
});

server.list()
.then(function (dbs) {
  console.log('There are ' + dbs.length + ' databases on the server.');
});

var db = server.use('RACOS');

var select = function select() {  
  db.select('room_code').from('room').scalar().then(function(rooms){
    console.log('rooms',rooms);
    });
}

// Create app
var app = module.exports = express();

var cp = require('child_process');
var pstree = require('ps-tree');
var globaltemp=25;
var globalstatus='OFF';
var acstatus;
// App configuration
app.engine('.html', consolidate.swig);
app.configure(function() {
    app.use(express.logger());
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.compress());
    app.use(express.static(__dirname + '/static'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

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
        labelForCommand: labelFor.command,
        acstatus: globalstatus,
        temp: globaltemp
    }));

    cp.exec("sudo /etc/init.d/lirc start", function(error) {});
    cp.exec("sudo /etc/init.d/lirc stop", function(error){});
    cp.exec("sudo /etc/init.d/lirc start", function(error) {});
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

      cp.exec("sudo /etc/init.d/lirc stop", function(error, stdout, stderr)    {
      if(error) {}
       //res.send("Error stopping LIRC");
       //res.send("Success");
      });
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

var outfiles = {};
var mode2child;

var outfile;
var outfiles='';
var count = 0;
var lircfile;
var jsonStr;
var filePath='content';
var codecontent;

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

app.post('/mode2/:name', function(req,res){
    
   // console.log(req.params.name);

    console.log('ac',req.body.ac);

    var acname = req.body.ac.toLowerCase();

    //lircdpath = path.join(__dirname, acname+'.conf');
    lircdpath = acname+'.conf'; 

    console.log('lirc', lircdpath);

    var copycmd = 'sudo cp /etc/lirc/lircdhead.conf ' + lircdpath;
 
    console.log(copycmd);
    cp.exec(copycmd);

    fs.writeFile(filePath,'',function(err){});

    //lircdpath = "/etc/lirc/lircdaircon.conf";
    combinedStream = CombinedStream.create();

    var jsonconfigfile = 'config_'+acname+'.json';
  
    jsonStr = {'commandLabels':{'aircon':{}}};
    console.log(JSON.stringify(jsonStr));
    console.log(jsonStr);

    jsonfile.writeFile(jsonconfigfile,jsonStr,function (err) {
      console.error(err);
    });



//    lirc_node.irsend.send_once(req.params.remote, req.params.command, function() {});
    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);
    //res.redirect(200,'/teach');

});

app.get('/mode2/:outfile', function(req,res){
     
  outfile = req.param("outfile");
  console.log(outfile);   

  var copybody = 'sudo cp ' + filePath + ' ' +'body';
 
  cp.exec(copybody, function(error, stdout, stderr) {
      if(error) {
       res.send("Error creating LIRC");}
      else {
       console.log("Success");}
    });

  //var body = filePath;
  var combine = 'combine';
  var combinedAC = 'lirc_'+lircdpath;
  var data;
  var tail = '/etc/lirc/lircdtail.conf';
  
  if (outfile == "COMMIT"){
   //Sync(function(){
     // console.log(getData(tail,data));

    var streams = [
      fs.createReadStream(lircdpath),
      fs.createReadStream('body'),
      fs.createReadStream(tail)
    ]

  MultiStream(streams).pipe(fs.createWriteStream(combine));    


  var cplirc = 'sudo cp combine /etc/lirc/lircd.conf';

  cp.exec(cplirc, function(error) {
    if(!error) {
      console.log('COPIED to ', cplirc);

    }

  });

  cp.exec("sudo /etc/init.d/lirc start", function(error, stdout, stderr) {
      if(error) {
       res.send("Error starting LIRC");
      }
      else {
       //res.send("Success");
       //res.setHeader('Cache-Control', 'no-cache');
       //res.send(200);

      }
    });
 
    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);
//   }
  }
  else if (outfile == "END"){
    pstree(mode2child.pid, function (err,children) {
      cp.spawn('kill', ['-9'].concat(children.map(function (p) {return p.PID})))
     }); 

    // Skip the 1st line 
    fs.readFile(outfiles, function(err, data) { // read file to memory
      if (!err) {
        data = data.toString(); // stringify buffer
        var position = data.toString().indexOf('\n'); // find position of new line element
        if (position != -1) { // if new line element found
            data = data.substr(position + 1); // subtract string based on first line length
            fs.writeFile(outfiles, outfiles, function() {});
            fs.appendFile(outfiles, data, function(err) { // write file
                if (err) { // if error, report
                    //console.log (err);
                }
            });
            fs.appendFile(filePath, "name ", function() {});
            fs.appendFile(filePath, outfiles, function() {});
            fs.appendFile(filePath, data, function(err) { // write file
                if (err) { // if error, report
                    //console.log (err);
                }
            });
            fs.appendFile(filePath, '\n', function() {});
         console.log(outfiles);
         console.log(data);
         //console.log(lircdpath);
        } else {
            console.log('no lines found');
        }
      } else {
        console.log('test', err);
        }
    });

     var target = outfiles;

     console.log('json: ', jsonStr['aircon']);


  } 
  else{
    outfiles = outfile.toString();
    var mode2command = "sudo mode2 -d /dev/lirc0 -m > " + outfiles;
  
  mode2child =  cp.exec(mode2command, function(error, stdout, stderr){
      if(error){
        res.send("Error sending "+ mode2command);

      }else {
        console.log("Successfully sent mode2 > "+outfiles);
       }
    });
 }
});
    
app.post('/schedule/:remote/:command', function(req,res) {
    
   // var job = new CronJob('00
    cp.exec("sudo /etc/init.d/lirc start", function (err) {

      if(!err) {

       //console.log('remote: ',req.body.remote);
       //console.log('date: ',req.body.datepicker);
       //console.log('start: ',req.body.start_time);
       //console.log('end: ',req.body.end_time);
       //console.log('temp: ',req.body.temp);
       //console.log('fan: ',req.body.fan);
     }
    });

  var arr_starttime = req.body.start_time.split(":");
  var arr_endtime = req.body.end_time.split(":");
  var arr_date = req.body.datepicker.split("-");
  var start_hr = req.body.start_time.split(":")[0];
  var start_min = req.body.start_time.split(":")[1];;
  var end_hr = req.body.end_time.split(":")[0];
  var end_min = req.body.end_time.split(":")[1].toString();
  var day = req.body.datepicker.split("-")[2];
  var month = req.body.datepicker.split("-")[1];
  var temp = req.body.temp;
  var year;  
  //var arr_starttime = arr_starttime.map(function (val) { 
  //  console.log("test: ", val) 
    
  //});

  console.log('remote: ',req.body.remote);
       console.log('start_hr: ',start_hr);
       console.log('start_min: ',start_min);
       console.log('end_hr: ',end_hr);
       console.log('end_min: ',end_min);
       console.log('day: ',day);
       console.log('month: ',month);
       console.log('temp: ',req.body.temp);
       console.log('fan: ',req.body.fan);


   /*Crontab.load(function(err, crontab){
     if (err) {
       console.log(err);
     } 
     else{
       cp.exec("sudo /etc/init.d/lirc start");
       crontab.create('sudo irsend SEND_ONCE aircon '+temp+'', '0 '+start_min+' '+start_hr+' '+day+' '+month+'');    
     }*/
   


   // });
  var start_pattern = '0 '+start_min+' '+start_hr+' '+day+' '+month+' *';
  var end_pattern = '0 '+end_min+' '+end_hr+' '+day+' '+month+' *';

  var start = schedule.scheduleJob(start_pattern, function() {

    cp.exec("sudo /etc/init.d/lirc start");
  
    var irsend = "sudo irsend SEND_ONCE aircon power";
    cp.exec(irsend, function() {});
    
    var tempsend = "sudo irsend SEND_ONCE aircon"+temp;
    cp.exec(tempsend,function() {});

    console.log("Let's start");

    globalstatus = 'ON'

}); 

  var end = schedule.scheduleJob(end_pattern, function() {

    cp.exec("sudo /etc/init.d/lirc start");
  
    var irsend = "sudo irsend SEND_ONCE aircon power";
    cp.exec(irsend, function() {});

    console.log("Changed");

    globalstatus = 'OFF';

}); 
    
    globaltemp = req.body.temp;
/*   
    res.send(JST['status2'].render({
        remotes: lirc_node.remotes,
        macros: config.macros,
        repeaters: config.repeaters,
        labelForRemote: labelFor.remote,
        labelForCommand: labelFor.command,
        temp: req.body.temp
    }));
*/
    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);


   // console.log('start' req.body.start

    //var acname = req.body.ac.toLowerCase();  

});


// Send :remote/:command one time
app.post('/remotes/:remote/:command', function(req, res) {

    cp.exec("sudo /etc/init.d/lirc start");

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
console.log("RACOS UI + API has started on port 3000.");
