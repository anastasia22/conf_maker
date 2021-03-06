var appData = require('./package.json');
var express = require('express');
var compress = require('compression');
var Q = require('q');
var path = require('path');
var exec = require('child_process').exec;
var fs =  require('fs');
var _ = require('underscore');
var app = express();
var bodyParser = require('body-parser');

var port = 8080;
var env = process.env.NODE_ENV || 'development';
var appEnvData = {
  version: appData.version,
  env: env,
  head_commit: "null"
}
var date_opts =  {
  year: 'numeric', month: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric'
};

require("node-jsx").install();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compress());
app.use(express.static(path.join(__dirname, 'dist')));

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

// index url
app.get('/', function(req, res){
  res.render('index', appEnvData);
});

//listen to github webhook notification
app.post('/payload', function(req, res) {
  var body = req.body;
  if (body.commits && body.commits.length){
    console.log(new Date().toLocaleString('uk', date_opts), 'GITHUB : changes to repository detected by :', body.pusher.email);
    // what have to be done to ensure latest steady version on test
    // we return success status only if all steps passed
    Q.fcall(pullUpdates, body)
      .then(updateNpm)
      .then(rebuildApp)
      .then(function(){
        res.status(200).send('Build success');
        console.log('res status 200 - Build success');
      }, function(err){
        res.status(409).send(err);
        console.log('res status 40* - Build failure', err);
      })
      .then(updateAppEnvData)
  } else {
    res.status(200).send('What is that? no commits, meh :/')
  }
});

//Route not found -- Set 404
app.get('*', function(req, res) {
  res.status(404).send("Sorry this page does not exist!");
});

app.listen(port);

console.log(new Date().toLocaleString('uk', date_opts), env.toUpperCase() + ' server is up and running at port : ' + port);
// functions to be run on git push notification
function pullUpdates(body){
  return new Promise(function(resolve, reject){
    exec('git pull', function(err, stdout, stderr){
      if (err){
        reject(err);
      } else {
        appEnvData.head_commit = JSON.stringify(_.pick(body.head_commit, 'message', 'timestamp', 'url', 'author'));
        resolve(body);
      }
      console.log('[pullUpdates] ::', err, stdout, stderr);
    });
  });
};
function updateNpm(body){
  return new Promise(function(resolve, reject){
    var modified = _.pluck(body.commits, 'modified');
    var isUpdateNeed;
    // iterate to look for changes in package.json
    modified.forEach(function(commit){
      commit.forEach(function(file){
        if (file === 'package.json'){
          isUpdateNeed = true;
        }
      });
    });
    // if found - update packages
    if (isUpdateNeed) {
      exec('npm install', function(err, stdout, stderr){
        if (err){
          reject(err)
        } else {
          resolve(body);
        }
        console.log('[updateNpm] ::', err, stdout, stderr);
      });
    } else {
      resolve();
    }
  });
}
function rebuildApp(body){
  return new Promise(function(resolve, reject){
    exec('gulp build', function(err, stdout, stderr){
      if(err){
        reject(err);
      } else {
        resolve(body);
      }
      console.log('[rebuildApp] :: \n', err, stdout, stderr);
    });
  });
}
function updateAppEnvData(){
  return new Promise(function(resolve, reject){
    fs.readFile('./package.json', 'utf-8', function(err, data){
      if (err){
        reject(err);
      } else {
        appEnvData.version = JSON.parse(data).version;
        resolve();
      }
      console.log('[updateAppEnvData] :: ', appEnvData.version);
    });
  });
}
