var net = require('net');
var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require('path');
var mkdirp = require('mkdirp');

var repoRoot = __dirname + '/repos';
var deployRoot = __dirname + '/deploys';

var pushover = require('pushover');
var repos = pushover(repoRoot);

var gitEmit = require('git-emit');
var git = fs.readdirSync(repoRoot).reduce(function (acc, repo) {
    acc[repo] = gitEmit(path.join(repoRoot, repo));
    acc[repo].on('update', onupdate.bind(null, repo));
    return acc;
}, {});

function onupdate (repo, update) {
    var branch = update.arguments[0].split('/')[2];
    var commit = update.arguments[2];
    
    var deployDir = path.join(deployRoot, repo, commit);
    mkdirp(deployDir, 0700, function (err) {
        if (err) update.reject(500, err)
        else deploy(repo, branch, commit, function (err) {
            if (err) update.reject(500, err)
            else update.accept()
        });
    });
}

function deploy (repo, branch, commit, cb) {
    var deployDir = path.join(deployRoot, repo, commit);
    var repoDir = path.join(repoRoot, repo);
    
    var ps = spawn('git', [ 'clone', '-b', branch, repoDir, deployDir ]);
    ps.stdout.pipe(process.stdout, { end : false });
    ps.stderr.pipe(process.stdout, { end : false });
    
    var dotDir = path.join(deployDir, '.stagecoach');
    ps.on('exit', function (code) {
        if (code !== 0) cb('clone exited with code ' + code);
        else path.exists(path.join(dotDir, 'start'), function (ex) {
console.log(dotDir);
            if (!ex) return;
            
            var port = Math.floor(Math.random() * 5e4 + 1e4);
            routes[commit] = port;
            
            var cwd = process.cwd();
            process.chdir(deployDir);
            var ps = spawn(path.join(dotDir, 'start'), [ port ]);
            process.chdir(cwd);
            
            ps.stdout.pipe(process.stdout, { end : false });
            ps.stderr.pipe(process.stdout, { end : false });
            
            cb(null);
        })
    });
}

repos.on('push', function (repo) {
    if (!git[repo]) {
        git[repo] = gitEmit(path.join(repoRoot, repo));
        git[repo].on('update', onupdate.bind(null, repo))
        onupdate(repo, {
            arguments : [ 'refs/head/master', null, 'master' ],
            accept : function () {},
        });
    }
});

var routes = {};
var bouncy = require('bouncy');
bouncy(function (req, bounce) {
    bounce(routes[req.headers.host] || 9045)
}).listen(7070);

var http = require('http');
var url = require('url');
http.createServer(function (req, res) {
    var u = url.parse(req.url);
    
    if (req.method === 'GET' && u.pathname === '/') {
        res.setHeader('content-type', 'application/json');
        res.write(JSON.stringify(routes, undefined, 2));
        res.end('\r\n');
    }
    else repos.handle(req, res)
}).listen(9045);
