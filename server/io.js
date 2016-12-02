var logger = require('./utils/logger.js');
var gameio = require('./gameio.js');

module.exports = function (http) {
    var io = require('socket.io', {multiplex: false})(http);
    io.use(require('./io.session.js'));
    io.on('connection', function (socket) {
        preventMutiple(io, socket);
        overWriteOn(socket);
        gameio(io, socket);
    });
};

function preventMutiple(io, socket) {
    var key = socket.sid;
    if (socket.session.user && socket.session.user.email)
        key = socket.session.user.email;
    logger.debug('prevent multiple', key);
    socket.join(key);
    var members = io.nsps['/'].adapter.rooms[key];
    Object.keys(members).forEach(function (sid) {
        if (!sid)
            return;
        if (sid == socket.id) {
            return;
        }
        var other = io.sockets.connected[sid];
        // console.log(sid, key);
        if (!other)
            return;
        other.emit('alert', new Message("다른곳에서 접속했어요.", true, 150000));
        other.disconnect();
    });
}

function Message(message, type, duration) {
    this.message = message;
    this.type = type;
    this.duration = duration;
}

function overWriteOn(socket) {
    var on = socket.on.bind(socket);
    var events = {};

    socket.on = function (name, fn) {
        if (events[name]) {
            socket.removeListener(name, events[name]);
        }
        on(name, fn);
        events[name] = fn;
    };
}