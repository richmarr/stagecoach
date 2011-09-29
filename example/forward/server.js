var stagecoach = require('../../');
var exec = require('child_process').exec;
var http = require('http');

http.createServer(function (req, res) {
    res.setHeader('content-type', 'text/plain');
    res.end('servers[0]\n');
}).listen(9000);

http.createServer(function (req, res) {
    res.setHeader('content-type', 'text/plain');
    res.end('servers[1]\n');
}).listen(9001);

exec('hostname', function (err, hostname) {
    var coach = stagecoach().listen(8000);
    coach.add('localhost', 9000);
    coach.add(hostname.trim(), 9001);
});
