var spawn = require('child_process').spawn;
var prehost = require('prehost');
var net = require('net');

module.exports = function () {
    var server = prehost(function (err, req) {
        if (err) console.error(err)
        else {
            req.stream.pause();
            var host = req.host.replace(/:\d+$/, '');
            var r = coach.routes[host];
            
            if (r) {
                // todo: connection pooling
                var c = r.host
                    ? net.createConnection(r.port, r.host)
                    : net.createConnection(r.port)
                ;
                
                c.on('connect', function () {
                    for (var i = 0; i < req.buffers.length; i++) {
                        c.write(req.buffers[i]);
                    }
                    req.stream.pipe(c);
                    c.pipe(req.stream);
                    req.stream.resume();
                });
            }
            else console.error('No such host: ' + host)
        }
    });
    
    var coach = new Coach(server);
    return coach;
};

function Coach (server) {
    this.server = server;
    this.routes = {};
}

Coach.prototype.listen = function () {
    var s = this.server;
    s.listen.apply(s, arguments);
    return this;
};

Coach.prototype.close = function () {
    var s = this.server;
    s.close.apply(s, arguments);
};

Coach.prototype.add = function (hostname, host, port) {
    if (!port) {
        port = host;
        host = undefined;
    }
    
    this.routes[hostname] = { host : host, port : port };
};

Coach.prototype.swap = function (src, dst) {
};
