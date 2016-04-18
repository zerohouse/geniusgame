var express = require('express'),
    app = express();

app.use(function (req, res, next) {
    res.charset = "utf-8";
    next();
});

require('./utils/util.js')();
app.http = require('http').Server(app);
require('./utils/parse.js')(app);
require('./utils/upload.js')(app);
require('./utils/store.js').registerApp(app);
require('./route/route.js')(app);
require('./io.js')(app.http);

module.exports = app;