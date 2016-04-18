var manager = {};
var logger = require('./../utils/logger.js');
var Game = {};
Game.seven = require('./seven/game.js');
Game.check = require('./check/game.js');

function Games() {
    this.sids = {};
    this.games = {};
}

Games.prototype.getGame = function (req) {
    if (!Game[req.type])
        return;
    if (!this.games[req.type])
        return;
    return this.games[req.type][req.id];
};

Games.prototype.newGame = function (req) {
    logger.debug('newgame', req);
    if (!Game[req.type])
        return;
    if (!this.games[req.type])
        this.games[req.type] = {};
    this.games[req.type][req.id] = new Game[req.type]();
    this.games[req.type][req.id].id = req.id;
    this.games[req.type][req.id].type = req.type;
    return this.games[req.type][req.id];
};


Games.prototype.getPlayingGame = function (sid) {
    if (!this.sids[sid])
        return;
    if (!this.sids.playing)
        return;
    if (this.sids.getPlayer(sid))
        return this.sids[sid];
};

Games.prototype.join = function (req, socket) {
    logger.debug('join', req);
    var game = this.getGame(req);
    if (!game)
        game = this.newGame(req);
    if (!game)
        return;
    this.sids[socket.sid] = game;
    game.join(socket);
};

Games.prototype.leave = function (sid) {
    logger.debug('leave games');
    if (!this.sids[sid]) {
        return;
    }
    this.sids[sid].leave(sid);
    if (!this.sids[sid].isEmpty()) {
        return;
    }
    var id = this.sids[sid].id;
    var type = this.sids[sid].type;
    logger.debug('destroy', type, id);
    this.sids[sid].destroy();
    this.games[type][id] = null;
    delete this.games[type][id];
    delete this.sids[sid];
};

Games.prototype.getGameList = function () {
    var list = {};
    var self = this;
    Object.keys(Game).forEach(function (type) {
        if (!self.games[type])
            return;
        list[type] = Object.keys(self.games[type]);
    });
    return list;
};

module.exports = Games;