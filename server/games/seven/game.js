var Player = require('./player.js');
var logger = require('./../../utils/logger.js');
var turnTime = 30000;
function Game() {
    var self = this;
    this.point = 0;
    this.players = [];
    this.turn = 0;
    this.e = [];
}

Game.prototype.restart = function () {
    logger.debug('restart');
    this.turn = 0;
    this.playing = false;
    this.players.forEach(function (p) {
        if (p.disconnect)
            p.in = false;
    });
    this.inPlayers.forEach(function (player) {
        player.playing = false;
    });
    this.startCheck();
};


Game.prototype.join = function (socket) {
    logger.debug('join seven');
    var player = this.getPlayer(socket.sid);
    if (!player) {
        this.players.push(new Player(socket, this));
        this.sync();
        return;
    }
    player.setSocket(socket);
    player.alertAll();
    this.sync();
};

Game.prototype.turnEndCheck = function () {
    logger.debug('turnEndCheck');
    var end = true;
    this.inPlayers.forEach(function (player) {
        if (player.isSubmitted())
            return;
        end = false;
    });
    if (!end)
        return;
    this.calculate();
};


Game.prototype.eCardCheck = function () {
    logger.debug('eCardCheck');
    var end = true;
    this.e.forEach(function (player) {
        if (player.eCard)
            return;
        end = false;
    });
    if (!end)
        return;
    this.e.forEach(function (player) {
        player.submitted = player.eCard;
    });
    this.calculate();
};


Game.prototype.calculateWinner = function () {
    logger.debug('calculateWinner');
    var x;
    var e;
    var self = this;
    var draw = false;
    var winner;
    this.inPlayers.forEach(function (player) {
        if (player.submitted === 'x') {
            x = true;
            return;
        }
        if (player.submitted === 'e') {
            e = true;
            self.e.push(player);
            return;
        }
        if (!winner) {
            winner = player;
            return;
        }
        if (winner.submitted > player.submitted)
            return;
        if (winner.submitted == player.submitted) {
            draw = true;
            return;
        }
        winner = player;
        draw = false;
    });
    return {x: x, e: e, winner: winner, draw: draw};
};

Game.prototype.zerosWin = function () {
    var zeros = [];
    this.inPlayers.forEach(function (player) {
        if (player.submitted !== 0)
            return;
        zeros.push(player.getInfo);
    });
    var length = zeros.length;
    if (length == 0)
        return false;
    var point = parseInt(this.point / length);
    zeros.forEach(function (player) {
        player.score += point;
        player.save();
    });
    this.point = this.point % length;
    this.sync({winners: zeros});
    return true;
};

Game.prototype.calculate = function () {
    logger.debug('calculate');
    var result = this.calculateWinner();
    this.sync('open');
    this.turnEnd();
    var delayPerPerson = 2000;
    var delay;
    if (this.eTime)
        delay = delayPerPerson * this.e.length;
    delay = delayPerPerson * this.inPlayers.length;
    var self = this;
    clearTimeout(this.timer);
    this.timer = setTimeout(nextStep, delay);
    function nextStep() {
        if (result.e) {
            self.waitForECards();
            return;
        }
        if (result.x) {
            self.alert("깽판이네? 깽판이여 아니여 이거 내가 봤어");
            self.setTimer(function () {
                self.turnStart();
            }, 3000);
            return;
        }
        if (result.draw) {
            if (!self.zerosWin())
                self.alert("승자가 없습니다.");
            self.setTimer(function () {
                self.turnStart();
            }, 3000);
            return;
        }
        result.winner.win();
        self.setTimer(function () {
            self.turnStart();
        }, 3000);
    }
};

Game.prototype.turnEnd = function () {
    this.turnEnded = true;
};

Game.prototype.waitForECards = function () {
    this.eTime = true;

    this.e.forEach(function (player) {
        player.eCard = undefined;
        if (player.disconnect) {
            player.submitRandom();
            return;
        }
        player.alert("카드를 제출해주세요.");
    });

    var self = this;
    this.setTimer(function () {
        self.e.forEach(function (p) {
            if (!p.eCard)
                p.submitRandom();
        });
    }, turnTime);
};

Game.prototype.alertTime = function (time, message) {
    this.players.forEach(function (p) {
        if (p.disconnect)
            return;
        p.alertTime(time, message);
    });
};

Game.prototype.getPlayerSize = function () {
    return this.players.length;
};

Game.prototype.getPlayers = function () {
    var result = [];
    this.players.forEach(function (p) {
        result.push(p.socket.player);
    });
    return result;
};


Game.prototype.getPlayer = function (sid) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].sid == sid)
            return this.players[i];
    }
};
Game.prototype.getInPlayer = function (sid) {
    for (var j = 0; j < this.inPlayers.length; j++) {
        if (this.inPlayers[j].sid == sid)
            return this.inPlayers[j];
    }
};

Game.prototype.isPlayingPlayer = function (sid) {
    if (!this.playing)
        return false;
    return this.getInPlayer(sid);
};

Game.prototype.send = function (message) {
    this.players.forEach(function (p) {
        p.send(message);
    });
};

Game.prototype.startCheck = function (val) {
    if (this.playing)
        return;
    var inPlayers = 0;
    this.players.forEach(function (player) {
        if (player.in)
            inPlayers++;
    });

    var self = this;
    if (inPlayers > 1) {
        if (val) {
            this.start();
            return;
        }
        this.setTimer(function () {
            self.startCheck(true);
        }, 5000);
        this.alert('5초후 게임이 시작됩니다.');
        return;
    }
    if (!this.timer)
        return;
    clearTimeout(this.timer);
    this.timer = false;
    this.alert("플레이어가 부족해 게임이 취소되었습니다.");
};

Game.prototype.alert = function (message, fail, duration) {
    this.players.forEach(function (player) {
        player.alert(message, fail, duration);
    });
};

Game.prototype.start = function () {
    this.inPlayers = [];
    var self = this;
    self.players.forEach(function (player) {
        if (!player.in)
            return;
        player.playing = true;
        self.inPlayers.push(player);
        player.start();
    });
    this.playing = true;
    this.alert("게임을 시작합니다");
    this.turnStart();
};


Game.prototype.turnStart = function () {
    this.eTime = false;
    this.e = [];
    if (this.turn > 8) {
        this.restart();
        return;
    }
    this.turnEnded = false;
    this.turn++;
    logger.debug('nextTurn');
    var self = this;
    this.inPlayers.forEach(function (player) {
        player.submitted = undefined;
        player.eCard = undefined;
        player.submitPoint();
        if (player.disconnect) {
            player.submitRandom();
        }
    });

    this.players.forEach(function (p) {
        if (p.playing) {
            p.alert((self.turn) + "번째 카드를 선택해주세요.");
            return;
        }
        p.alert((self.turn) + "번째");
    });
    this.sync();
    this.setTimer(function () {
        self.inPlayers.forEach(function (p) {
            if (!p.isSubmitted())
                p.submitRandom();
        });
    }, turnTime);
};

Game.prototype.setTimer = function (fn, time) {
    clearTimeout(this.timer);
    this.timer = setTimeout(fn, time);
    this.players.forEach(function (p) {
        if (p.disconnect)
            return;
        p.alertTime(time);
    });
};


Game.prototype.sync = function (val) {
    var state = {};
    state.type = val;
    state.players = [];
    this.players.forEach(function (player) {
        state.players.push(player.getInfo());
    });
    var game = {};
    game.playing = this.playing;
    game.id = this.id;
    game.turn = this.turn;
    game.point = this.point;
    this.players.forEach(function (player) {
        if (player.disconnect)
            return;
        game.submitted = player.submitted;
        game.eCard = player.eCard;
        state.game = game;
        player.socket.emit('sevengame.sync', state);
    });
};

Game.prototype.isPlayingPlayerExist = function (sid) {
    if (!this.playing)
        return false;
    for (var i = 0; i < this.inPlayers.length; i++) {
        var player = this.inPlayers[i];
        if (!player.disconnect && player.sid != sid)
            return true;
    }
    return false;
};


Game.prototype.isEmpty = function () {
    if (!this.playing)
        return this.players.length == 0;
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (!player.playing)
            return false;
        if (player.playing && !player.disconnect)
            return false;
    }
    return true;
};

Game.prototype.leave = function (sid) {
    logger.debug('game leave' + sid);
    var player = this.getPlayer(sid);
    if (!player)
        return;
    if (!this.playing) {
        this.players.remove(player);
        this.sync();
        return;
    }
    if (!player.playing) {
        this.players.remove(player);
        this.sync();
        return;
    }
    player.disconnect = true;
    this.sync();
};

Game.prototype.destroy = function () {
    clearTimeout(this.timer);
};

module.exports = Game;