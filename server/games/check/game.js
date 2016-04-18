var block = require('./block.js');
var Player = require('./player.js');

function Game() {
    this.restart();
    this.players = [];
}

Game.prototype.restart = function () {
    this.blocks = block.random();
    this.results = [];
    this.discovered = [];
    this.getAllResults();
};

Game.prototype.send = function (message) {
    this.players.forEach(function (p) {
        p.send(message);
    });
};

Game.prototype.join = function (socket) {
    this.players.push(new Player(socket, this));
    this.sync(true);
};

Game.prototype.sync = function (reset) {
    var send = {};
    send.reset = reset;
    send.blocks = this.blocks;
    send.discovered = this.discovered;
    send.players = this.players;
    send.players = [];
    this.players.forEach(function (player) {
        send.players.push(player.getInfo());
    });
    this.players.forEach(function (player) {
        player.socket.emit('checkgame.game', send);
    });
};


Game.prototype.alert = function (message, fail, duration) {

    this.players.forEach(function (player) {
        player.alert(message, fail, duration);
    });
};


Game.prototype.leave = function (sid) {
    this.players.remove(this.getPlayer(sid));
};

Game.prototype.isEmpty = function () {
    return this.players.length == 0;
};

Game.prototype.getPlayerSize = function () {
    return this.players.length;
};

Game.prototype.getPlayer = function (sid) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].sid == sid)
            return this.players[i];
    }
};


Game.prototype.done = function () {
    return this.results.length == 0;
};

Game.prototype.check = function (selects) {
    if (selects == undefined) return false;
    if (selects.length != 3) return false;
    selects.sort();
    var result = selects.join("");
    if (this.results.contains(result)) {
        this.results.remove(result);
        this.discovered.push(result);
        return true;
    }
    return false;
};

Game.prototype.destroy = function () {

};

Game.prototype.getAllResults = function () {
    if (this.blocks.length < 3)
        return;
    for (var i = 0; i < this.blocks.length - 2; i++) {
        for (var j = i + 1; j < this.blocks.length - 1; j++) {
            for (var k = j + 1; k < this.blocks.length; k++) {
                if (check(this.blocks[i], this.blocks[j], this.blocks[k]))
                    this.results.push(i + "" + j + "" + k);
            }
        }
    }

    function check(block1, block2, block3) {
        return allSameOrDiff(block1.shape, block2.shape, block3.shape) &&
            allSameOrDiff(block1.color, block2.color, block3.color) &&
            allSameOrDiff(block1.back, block2.back, block3.back);
        function allSameOrDiff(val1, val2, val3) {
            if (val1 == val2) {
                return val2 == val3;
            }
            if (val2 == val3)
                return false;
            return val3 != val1;
        }
    }
};

module.exports = Game;