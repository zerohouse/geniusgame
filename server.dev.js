var express = require('express'),
    app = require('./server/app.js'),
    path = require('path');

app.use('/', express.static('./'));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.http.listen(80, function () {
    console.log('listening on *:80');
});


