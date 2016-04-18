var path = '/update/deploy',
    port = 7777,
    secret = 'myhashsecret',
    logfile = 'push.log',
    cmd = [
        'git pull',
        'npm install',
        'grunt',
        'pm2 stop server.js',
        'pm2 start server.js'
    ];


var http = require('http');
var createHandler = require('github-webhook-handler');
var handler = createHandler({path: path, secret: secret});
var exec = require('sync-exec');
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            filename: logfile
        })
    ]
});

http.createServer(function (req, res) {
    handler(req, res, function (err) {
        res.statusCode = 404;
        res.end('no such location')
    })
}).listen(port);

handler.on('error', function (err) {
    logger.warn('Error:', err.message);
});

handler.on('push', function (event) {
    logger.info('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref);
    cmd.forEach(function (cmd) {
        logger.info(exec(cmd).stdout);
    });
});