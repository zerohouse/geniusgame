var logger = require('./../../utils/logger.js');
var store = require('./../../utils/store.js');
var db = require('./../../db/db.js');
var highest = require('./../highest.js');

function Player(socket, game) {
    logger.debug(socket.session.user.name, socket.sid);
    this.score = socket.session.user.score;
    this.name = socket.session.user.name;
    this.sid = socket.sid;
    this.game = game;
    this.combo = 1;
    this.lastPoint = 1;
    this.last = new Date();
    this.setSocket(socket);
    var self = this;
    socket.on('checkgame.check', function (selects) {
        self.check(selects);
    });

    socket.on('checkgame.done', function () {
        self.done();
    });

    socket.on('checkgame.steampack', function (i) {
        self.steam(i);
    });

    socket.on('chat', function (message) {
        message.from = self.getInfo();
        if (message.to) {
            self.game.getPlayer(message.to.sid).send(message);
            return;
        }
        self.game.send(message);
    });
}

var steam = [{point: 15, booster: 2, timeout: 30000, name: "헉헉"}, {
    point: 30,
    booster: 4,
    timeout: 30000,
    name: "하악하악"
}, {
    point: 150,
    booster: 10,
    timeout: 60000, name: "부와아악"
}];

Player.prototype.send = function (message) {
    if (this.disconnect) {
        return;
    }
    this.socket.emit('chat', message);
};

Player.prototype.steam = function (i) {
    if (this.booster)
        return;
    if (this.score < steam[i].point)
        return;
    this.game.alert(this.name + "님이 " + steam[i].name + "을 사용했습니다.");
    this.socket.emit('checkgame.steamstart', i);
    this.score = this.score - steam[i].point;
    this.booster = steam[i].booster;
    this.game.sync();
    var self = this;
    setTimeout(function () {
        self.booster = undefined;
        self.emit('checkgame.steamend', i);
        self.sync();
    }, steam[i].timeout);
};


Player.prototype.check = function (selects) {
    if (this.delayCheck())
        return;
    var check = this.game.check(selects);
    if (!check) {
        this.plus(-1);
        this.game.sync();
        return;
    }
    this.plus(1);
    this.game.sync();
};

Player.prototype.done = function () {
    if (this.delayCheck())
        return;
    var done = this.game.done();
    if (!done) {
        this.plus(-3);
        this.game.sync();
        return;
    }
    this.plus(3);
    this.game.restart();
    this.game.sync();
};

Player.prototype.plus = function (point) {
    var type = "합";
    var result = "실패";
    var combo = "";
    if (Math.abs(point) == 3)
        type = "결";
    if (point > 0)
        result = "성공";

    var self = this;
    if (isSame(point) && (new Date().getTime() < this.last.getTime() + 2500)) {
        this.combo++;
        combo = this.combo + "연속 ";
    }
    else
        this.combo = 1;
    point = point * this.combo * this.combo;
    this.score += point;
    this.game.alert(this.name + "님 " + type + " " + result + " " + combo + " " + point);
    this.lastPoint = point;
    this.last = new Date();
    this.save();
    function isSame(point) {
        if (!self.lastPoint)
            return;
        if (point > 0)
            return self.lastPoint > 0;
        return self.lastPoint < 0;
    }
};

Player.prototype.delayCheck = function () {
    if (new Date().getTime() < this.last.getTime() + 500) {
        return true;
    }
};

Player.prototype.getInfo = function () {
    var info = {};
    info.score = this.score;
    info.name = this.name;
    info.sid = this.sid;
    info.combo = this.combo;
    info.booster = this.booster;
    return info;
};

Player.prototype.setSocket = function (socket) {
    this.socket = socket;
};

Player.prototype.save = function () {
    this.socket.session.user.score = this.score;
    store.set(this.sid, this.socket.session);
    if (!this.socket.session.user.email)
        return;
    db.User.update({email: this.socket.session.user.email}, {score: this.score}, function (er, res) {
    });
};

Player.prototype.alert = function (message, fail, duration) {
    var m = new Message(message, fail, duration);
    this.socket.emit('alert', m);
};

function Message(message, fail, duration) {
    this.message = message;
    this.fail = fail;
    this.duration = duration;
}


module.exports = Player;