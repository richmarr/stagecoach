stagecoach
==========

Shuffle servers around to make staging instances super simple for continuous
integration.

examples
========

forward.js
----------

Spin up 2 http servers and forward localhost:8000 to :9000 and $(hostname):8000
to :9001.

````javascript
var stagecoach = require('stagecoach');
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
````

swap.js
-------

Spin up 2 servers and swap the servers every 2 seconds between sitting at
localhost:8000 and $(hostname):8000.

````javascript
var stagecoach = require('../');
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

exec('hostname', function (err, out) {
    var hostname = out.trim();
    
    var coach = stagecoach().listen(8000);
    coach.add('localhost', 9000);
    coach.add(hostname, 9001);
    
    setInterval(function () {
        coach.swap('localhost', hostname);
    }, 2000);
});
````

methods
=======

````javascript
var stagecoach = require('stagecoach');
var coach = stagecoach();
````

coach.listen(port)
------------------

Listen on a port.

coach.add(from, to)
-------------------

Map the hostname string `from` to the host, port, "host:port", or
`{ host : ..., port : ... }` value `to`.

Incoming requests for the hostname `from` will be forwarded to `to`.
Incoming `from` hostnames will have any ":port" values stripped out.

coach.swap(x, y)
----------------

Swap the routes for hostnames `x` and `y`.

todo
====

* hooks for load-balancing (an array or callback for .add()'s `to`)

install
=======

With [npm](http://npmjs.org) do:

    npm install stagecoach

license
=======

MIT/X11
