var logger = require('./../../utils/logger.js');
var store = require('./../../utils/store.js');
var db = require('./../../db/db.js');
var highest = require('./../highest.js');

Player = function (socket, game) {
    logger.debug(socket.session.user.name, socket.sid);
    this.score = socket.session.user.score;
    this.name = socket.session.user.name;
    this.sid = socket.sid;
    socket.session.user = this;
    this.cards = [0, 1, 2, 3, 4, 5, 6, 7, 'e', 'x'];
    var self = this;
    this.game = game;
    this.alerts = [];
    this.setSocket(socket);
    this.save();
};

Player.prototype.start = function () {
    this.cards = [0, 1, 2, 3, 4, 5, 6, 7, 'e', 'x'];
};

Player.prototype.alertTime = function (time, message) {
    if (this.disconnect)
        return;
    this.socket.emit('sevengame.time', time);
};

Player.prototype.setSocket = function (socket) {
    logger.debug('setSocket');
    this.disconnect = false;
    this.socket = socket;
    var self = this;
    socket.on('sevengame.in', function (val) {
        logger.debug('in');
        self.setIn(val);
    });
    socket.on('sevengame.submit', function (i) {
        logger.debug('sevengame.submit', i);
        self.submit(i);
    });

    socket.on('chat', function (message) {
        message.from = self.getInfo();
        if (message.to) {
            self.game.getPlayer(message.to.sid).send(message);
            return;
        }
        self.game.send(message);
    });
};

Player.prototype.send = function (message) {
    if (this.disconnect) {
        return;
    }
    this.socket.emit('chat', message);
};

Player.prototype.submitPoint = function () {
    this.score--;
    this.game.point++;
    this.save();
};

Player.prototype.isSubmitted = function () {
    return this.submitted !== undefined;
};

Player.prototype.getInfo = function (submitted) {
    var player = {};
    player.playing = this.playing;
    player.name = this.name;
    player.score = this.score;
    player.sid = this.sid;
    player.cards = this.cards;
    player.in = this.in
    player.disconnect = this.disconnect;
    if (!this.game.turnEnded) {
        if (this.isSubmitted()) {
            player.submitted = true;
        }
        return player;
    }
    else
        player.submitted = this.submitted;
    return player;
};


Player.prototype.alert = function (message, fail, duration) {
    var m = new Message(message, fail, duration);
    this.alerts.push(m);
    if (this.disconnect) {
        return;
    }
    this.socket.emit('sevengame.alert', m);
};

Player.prototype.alertAll = function () {
    var self = this;
    this.alerts.forEach(function (alert) {
        self.socket.emit('sevengame.alert', alert);
    });
};

Player.prototype.setIn = function (val) {
    this.in = val;
    if (val && !this.playing)
        this.game.alert(this.name + "님이 참여합니다.");
    this.game.startCheck();
    this.game.sync();
};

Player.prototype.submit = function (index) {
    if (!this.game.playing)
        return;
    if (this.isSubmitted()) {
        this.changeSubmitted(index);
        return;
    }
    if (this.cards.length - 1 < index)
        this.submitted = 1;
    else
        this.submitted = this.cards.splice(index, 1)[0];

    this.game.turnEndCheck();
    this.game.sync();
};

Player.prototype.submitRandom = function () {
    this.submit(parseInt(this.cards.length * Math.random()));
};


Player.prototype.changeSubmitted = function (index) {
    if (!this.game.turnEnded) {
        var tmp = this.submitted;
        this.submitted = this.cards[index];
        this.cards[index] = tmp;
        this.game.sync();
        return;
    }
    if (this.submitted == 'e') {
        if (!this.eCard) {
            this.eCard = this.cards.splice(index, 1)[0];
            this.game.eCardCheck();
            this.game.sync();
            return;
        }
        tmp = this.eCard;
        this.eCard = this.cards[index];
        this.cards[index] = tmp;
        this.game.eCardCheck();
        this.game.sync();
        return;
    }
    this.alert("낼 차례가 아닙니다.");
};

Player.prototype.win = function () {
    if (this.disconnect) {
        this.game.alert(this.name + "님이 " + this.submitted + "으로 높지만, 연결이 끊겨 칩은 다음 라운드로 넘어갑니다.");
        return;
    }
    if (this.submitted < 4) {
        this.game.inPlayers.forEach(function (player) {
            player.submitPoint();
        });
    }
    this.score += this.game.point;
    this.game.point = 0;
    logger.debug(this.sid);
    this.game.sync({winner: [this.sid]});
    this.save();
};

Player.prototype.save = function () {
    this.socket.session.user.score = this.score;
    store.set(this.sid, this.socket.session);
    if (!this.socket.session.user.email)
        return;
    db.User.update({email: this.socket.session.user.email}, {score: this.score}, function (er, res) {
    });
};


function Message(message, fail, duration) {
    this.message = message;
    this.fail = fail;
    this.duration = duration;
}
module.exports = Player;