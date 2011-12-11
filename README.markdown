stagecoach
==========

Stagecoach is a git deploy server and http router for continuous deployment.

When you `git push` to stagecoach, the code spins up on a new subdomain based on
the commit hash.

You can then alias commit hash domains to client-facing subdomains using custom
routing logic to do feature splits, A/B tests, or incremental phased deployment.

status
======

The first part of the CLI tool that hosts a git server over http and brings up
new domains works.

The ports are hard-coded which is lame. Authentication over basic auth needs to
be implemented too.

The API for modifying the routing logic needs merged from the old code into the
bin script.

get started
===========

Create a `deploy.json` file in a git repo with a `"start"` key:

``` js
{ "start" : "node server.js" }
```

The `"start"` command will be passed a port to listen on as its first argument.

Fire up a new git deploy server using the `stagecoach` command:

    stagecoach

Push to the deploy server from your repo:

    git push http://localhost:7070 master

Navigate to the commit hash subdomain on the deploy server:

    curl -H host:f117c05cb138b360e2d4dcd5b354ab2a5408adeb.localhost localhost:7070

Hooray it worked.

TODO: feature routing

license
=======

MIT/X11
