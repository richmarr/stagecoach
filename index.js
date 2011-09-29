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
                    ? net.createConnection(r.port || coach.port, r.host)
                    : net.createConnection(r.port || coach.port)
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
    this.port = null;
}

Coach.prototype.listen = function (port) {
    var s = this.server;
    this.port = port;
    s.listen.apply(s, arguments);
    return this;
};

Coach.prototype.close = function () {
    var s = this.server;
    s.close.apply(s, arguments);
};

Coach.prototype.add = function (from, to) {
    var dst = {};
    if (typeof to === 'object') {
        dst = to;
    }
    else if (typeof to === 'number') {
        dst.port = to;
    }
    else if (typeof to === 'string') {
        if (to.match(/^\d+$/)) {
            dst.port = parseInt(to, 10);
        }
        else {
            var s = to.split(':');
            dst.host = s[0];
            dst.port = s[1];
        }
    }
    this.routes[from] = dst;
};

Coach.prototype.swap = function (src, dst) {
};
