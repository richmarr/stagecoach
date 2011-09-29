var test = require('tap').test;
var stagecoach = require('../');
var exec = require('child_process').exec;
var http = require('http');

test('forward', function (t) {
    var p = Math.floor(Math.random() * (Math.pow(2,16) - 1e4)) + 1e4;
    var p0 = Math.floor(Math.random() * (Math.pow(2,16) - 1e4)) + 1e4;
    var p1 = Math.floor(Math.random() * (Math.pow(2,16) - 1e4)) + 1e4;
    
    var s0 = http.createServer(function (req, res) {
        res.setHeader('content-type', 'text/plain');
        res.end('servers[0]\n');
    });
    s0.listen(p0, ready);
    
    var s1 = http.createServer(function (req, res) {
        res.setHeader('content-type', 'text/plain');
        res.end('servers[1]\n');
    });
    s1.listen(p1, ready);
    
    var hostname = null;
    exec('hostname', function (err, out) {
        hostname = out.trim();
        coach.add(hostname, p1);
        ready();
    });
    
    var coach = stagecoach().listen(p, ready);
    coach.add('localhost', p0);
    
    var pending = {};
    
    pending.ready = 4;
    function ready () {
        if (--pending.ready > 0) return;
        var opts0 = {
            host : 'localhost',
            port : p,
            path : '/'
        };
        http.get(opts0, function (res) {
            var s = '';
            res.on('data', function (buf) {
                s += buf.toString();
            });
            
            res.on('end', function () {
                t.equal(s.trim(), 'servers[0]');
                s0.close();
                done();
            });
        });
        
        var opts1 = {
            host : hostname,
            port : p,
            path : '/'
        };
        http.get(opts1, function (res) {
            var s = '';
            res.on('data', function (buf) {
                s += buf.toString();
            });
            
            res.on('end', function () {
                t.equal(s.trim(), 'servers[1]');
                s1.close();
                done();
            });
        });
    }
    
    pending.done = 2;
    function done () {
        if (--pending.done > 0) return;
        coach.close();
        t.end();
    }
});
