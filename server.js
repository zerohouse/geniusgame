var app = require('./server/app.js');

app.http.listen(3000, function () {
    console.log('listening on *:3000');
});