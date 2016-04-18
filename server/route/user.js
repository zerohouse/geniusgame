var db = require('./../db/db.js');
var logger = require('./../utils/logger.js');

function Result(result) {
    this.result = result;
}

function Error(err) {
    this.error = err;
}

module.exports = function (app) {
    app.post('/api/user', function (req, res) {
        var user = new db.User(req.passed);
        user.save(function (err, r) {
            if (err)
                res.send(new Error(err));
            res.send(new Result(r));
        });
    });

    app.post('/api/user/login', function (req, res) {
        db.User.findOne(req.passed, function (err, r) {
            if (r == null) {
                res.send(new Error("해당 정보 없습니다."));
                return;
            }
            r.password = undefined;
            req.session.user = r;
            req.session.save();
            res.send(new Result(r));
        });
    });

    app.get('/api/user/session', function (req, res) {
        if (req.session.user) {
            res.send({user: req.session.user});
            return;
        }
        res.send({});
    });

    app.get('/api/logout', function (req, res) {
        req.session.destroy();
        res.send({});
    });

    app.put('/api/user', function (req, res) {
        var user = req.passed;
        if (!req.session.user) {
            res.send('잘못된 접근입니다.');
            return;
        }
        if (!req.session.user.email) {
            res.send('잘못된 접근입니다.');
            return;
        }
        if (req.session.user.email != user.email) {
            res.send('잘못된 접근입니다.');
            return;
        }
        req.session.user.name = user.name;
        req.session.save();
        db.User.update({email: user.email}, user, {}, function (e, r) {
            res.send('정보 변경되었습니다.');
        });
    });
};