var random = require('./../utils/random.js');
var fs = require('fs');
var mailInfo = JSON.parse(fs.readFileSync('./../.mailinfo.json', encoding = "utf8"));
var nodemailer = require('nodemailer');
var db = require('./../db/db.js');
var logger = require('./../utils/logger.js');
var sesTransport = require('nodemailer-ses-transport');
var content = function (to, key) {
    return "<html><body><h1><a href='" + mailInfo.url + "'>PICKS</a></h1>" +
        "<form action='" + mailInfo.url + "/api/password/redefine' method='get'>" +
        "<input type='password' placeholder='변경 비밀번호' name='password'>" +
        "<input type='hidden' name='key' value='" + key + "'>" +
        "<input type='hidden' name='email' value='" + to + "'>" +
        "<input type='submit' value='비밀번호 변경'></form></body></html>";
};

var options = {
    accessKeyId: mailInfo.accessKeyId,
    secretAccessKey: mailInfo.secretAccessKey,
    rateLimit: 5
};

var transporter = nodemailer.createTransport(sesTransport(options));


function sendMail(to, key) {
    var mailOptions = {
        from: 'Picks ✔ <parksungho86@gmail.com>', // sender address
        to: to,
        subject: 'PICKS 패스워드 변경메일입니다. ✔', // Subject line
        html: content(to, key) // html body
    };
    transporter.sendMail(mailOptions, function (error, info) {
    });
}


function Error(err) {
    this.error = err;
}



module.exports = function (app) {

    app.get('/api/password', function (req, res) {
        var email = req.passed.email;
        db.User.findOne({email: email}, function (e, r) {
            if (r == null) {
                res.send(new Error("가입 아직 안하셨는데요?"));
                return;
            }
            db.passwordKey.findOne({email: email}, function (e, r) {
                if (r != null && r.key != "" && r.day == new Date().getDay()) {
                    res.send(new Error("메일 이미 보냈습니다.(메일을 지웠다면 내일 다시 시도하세요.)"));
                    return;
                }
                var key = random.key(10);
                var day = new Date().getDay();
                db.passwordKey.update({email: email}, {key: key, day: day}, {upsert: true}, function (e, r) {
                    sendMail(email, key);
                    res.send('ok');
                });
            });
        });
    });

    app.get('/api/password/redefine', function (req, res) {
        if (req.passed.key == undefined || req.passed.key == "") {
            res.send("잘못된 접근이요~");
            return;
        }
        if (!req.passed.password) {
            res.send("잘못된 접근이요~");
            return;
        }
        if (req.passed.password.length < 4) {
            res.send("패스워드 4자이상이요~");
            return;
        }
        db.passwordKey.findOneAndUpdate({email: req.passed.email, key: req.passed.key}, {key: ""}, function (e, r) {
            if (r == null) {
                res.send("이미 변경하셨거나, 잘못된 접근입니다.");
                return;
            }
            db.User.update({email: r.email}, {password: req.passed.password}, function (e, r) {
                res.send("변경되었습니다.<a href='/'>picks 홈</a>");
            });
        });
    });
};