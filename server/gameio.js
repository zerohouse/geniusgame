var Games = require('./games/games.js');
var logger = require('./utils/logger.js');
var games = new Games();
var highest = require('./games/highest.js');

module.exports = function (io, socket) {
    socket.emit('highest', highest.highest);

    socket.on('join', function (req) {
        var gameDisconnected = games.getPlayingGame(socket.sid);
        var game = games.getGame(req);
        if (gameDisconnected) {
            if (game != gameDisconnected) {
                socket.emit('redirect', {state: game.type, params: {id: game.id}, message: '진행중인 게임이 있습니다. 다시 연결합니다.'});
                return;
            }
        }
        games.join(req, socket);
        io.sockets.emit('gameList', games.getGameList());
    });

    socket.on('leave', function () {
        logger.debug('send leave', socket.sid);
        games.leave(socket.sid);
        io.sockets.emit('gameList', games.getGameList());
    });

    socket.on('disconnect', function () {
        logger.debug('disconnect', socket.sid);
        games.leave(socket.sid);
        io.sockets.emit('gameList', games.getGameList());
    });
};
