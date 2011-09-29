var spawn = require('child_process').spawn;
var prehost = require('prehost');
var net = require('net');

module.exports = function () {
    var server = prehost(function (err, req) {
        if (err) console.error(err)
        else {
            req.stream.pause();
            var host = req.host.replace(/:\d+$/, '');
            var target = coach.routes[host];
            
            if (target) {
                // todo: connection pooling
                net.createConnection(target, function (s) {
                    for (var i = 0; i < req.buffers.length; i++) {
                        s.write(req.buffers[i]);
                    }
                    req.stream.pipe(s);
                    req.stream.resume();
                });
            }
            else console.error('No such host: ' + host)
        }
    });
    
    var coach = Coach(server);
    return coach;
};

function Coach (server) {
    this.server = server;
    this.routes = {};
}

Coach.prototype.add = function (hostname, host, port) {
    if (!port) {
        port = host;
        host = undefined;
    }
    
    this.routes[hostname] = { host : host, port : port };
};

Coach.prototype.swap = function (src, dst) {
};
