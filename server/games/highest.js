var db = require('./../db/db.js');
var highest = {};
db.Record.findOne({type: 'highest'}, function (err, result) {
    if (!err && result != undefined)
        highest.highest = result.record;
});
//
//highest.updateHighest = function (p) {
//    var highest = highest.highest;
//    for (var i = 0; i < highest.length; i++) {
//        if (highest[i].sid == p.sid) {
//            highest[i] = p;
//            db.Record.update({type: 'highest'}, {record: highest}, {upsert: true}, function (e, r) {
//            });
//            return;
//        }
//    }
//    for (var j = 0; j < 10; j++) {
//        if (highest[j] == undefined) {
//            highest[j] = p;
//            db.Record.update({type: 'highest'}, {record: highest}, {upsert: true}, function (e, r) {
//            });
//            //io.sockets.emit('alert', new Message(games[socket.roomId].name + "방의 " + p.name + "님 " + p.score + "점으로 통합 10위에 진입하셨습니다."));
//            return;
//        }
//        if (highest[j].score < p.score) {
//            highest[j] = p;
//            db.Record.update({type: 'highest'}, {record: highest}, {upsert: true}, function (e, r) {
//            });
//            //io.sockets.emit('alert', new Message(games[socket.roomId].name + "방의 " + p.name + "님 " + p.score + "점으로 통합 10위에 진입하셨습니다."));
//            return;
//        }
//    }
//};

module.exports = highest;