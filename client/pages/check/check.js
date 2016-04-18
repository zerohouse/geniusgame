app.controller('check', function ($scope, alert, socket, $stateParams, user, $state, $timeout) {

    $scope.user = user;

    $scope.$watch('hide', function (hide) {
        if (!$scope.player)
            return;
        if ($scope.players[0].id != $scope.player.id)
            return;
        socket.emit('checkgame.hide', hide);
    });

    $scope.$watch('player.booster', function (booster) {
        if (booster) {
            document.querySelector('body').classList.add('steam');
            return;
        }
        document.querySelector('body').classList.remove('steam');
    });


    $scope.steamstart = function (val) {
        var start;
        window.requestAnimationFrame(startTimer);
        function startTimer(tick) {
            if (!start)
                start = val + tick;
            $scope.time = parseInt((start - tick) / 100) / 10;
            $scope.$apply();
            if ($scope.time > 0 && $scope.player.booster)
                window.requestAnimationFrame(startTimer);
        }
    };

    $scope.steampack = function (i) {
        var require = [15, 30, 150];
        if (!$scope.player) {
            return;
        }
        if ($scope.player.booster)
            return;
        if ($scope.player.score < require[i])
            return;
        var alerts = [
            "15포인트를 소모하여 30초간 증가/감소하는 점수가 2배가 됩니다.",
            "30포인트를 소모하여 30초간 증가/감소하는 점수가 4배가 됩니다.",
            "150포인트를 소모하여 60초간 증가/감소하는 점수가 10배가 됩니다."]
        if (!confirm(alerts[i]))
            return;
        socket.emit('checkgame.steampack', i);
    };

    $scope.id = user.email;
    $scope.roomId = $stateParams.id;

    $scope.$watch('orderedPlayers[0]', function (p) {
        if (p == undefined)
            return;
        if (p.score == 0)
            return;
        if (this.order != undefined && p.id == this.order.id)
            return;
        this.order = p;
        alert(p.name + "님이 " + p.score + "점으로 " + "방 1위 입니다.");
    });

    $scope.resetShapes = function () {
        $scope.shapes = [];
        var shapes = ['fa-umbrella', 'fa-heart', 'fa-phone', 'fa-plus', 'fa-bell', 'fa-star', 'fa-circle'];
        for (var i = 0; i < 3; i++) {
            $scope.shapes[i] = "fa " + shapes.splice(parseInt(Math.random() * shapes.length), 1);
        }
    };


    $scope.colors = ['#4337FD', '#FD3737', '#FDD237'];

    $scope.backs = ['#000', '#888', '#FFF'];

    $scope.selects = [];
    $scope.messages = [];

    $scope.format = {};
    $scope.format.selects = function (selects) {
        var result = [];
        selects.forEach(function (block) {
            result.push($scope.blocks.indexOf(block) + 1);
        });
        result.sort();
        return result.join(", ");
    };
    $scope.format.discovered = function (string) {
        if (string == undefined)
            return;
        var result = [];
        result.push(parseInt(string[0]) + 1);
        result.push(parseInt(string[1]) + 1);
        result.push(parseInt(string[2]) + 1);
        return result.join(", ");
    };

    $scope.selectBlock = function (block) {
        $scope.selects.toggle(block);
        block.select = !block.select;
        $scope.already = false;
        if ($scope.selects.length < 3)
            return;
        if ($scope.selects.length > 3) {
            $scope.selects.splice(0, 1)[0].select = false;
        }
        var se = $scope.format.selects($scope.selects);
        $scope.discovered.forEach(function (each) {
            if ($scope.format.discovered(each) == se) {
                $scope.already = $scope.discovered.indexOf(each);
            }
        });
    };

    $scope.style = function (block) {
        var style = {};
        style.color = $scope.colors[block.color];
        style['background-color'] = $scope.backs[block.back];
        return style;
    };

    $scope.selects = [];


    $scope.check = function () {
        if ($scope.selects.length != 3)
            return;
        if ($scope.already !== false)
            return;
        var selects = [];
        $scope.selects.forEach(function (block) {
            selects.push($scope.blocks.indexOf(block));
        });
        socket.emit('checkgame.check', selects);
    };

    $scope.done = function () {
        socket.emit('checkgame.done');
    };

    $scope.send = function (message) {
        if (message == undefined)
            return;
        if (message == '') {
            return;
        }
        socket.emit('checkgame.chat', message);
    };

    $scope.alerts = alert.getAlerts();

    $scope.prompt = function (val) {
        window.prompt("URL", "http://picks.be/check/" + val);
    };


    socket.on('checkgame.steamstart', function (i) {
        var val = 30000;
        if (i == 2)
            val = 60000;
        $scope.steamstart(val);
    });

    socket.on('checkgame.move', function (id) {
        $state.go('check', {id: id});
    });

    socket.on('checkgame.steamend', function () {
        $scope.steamend();
    });

    socket.on('checkgame.game', function (send) {
        var selects;
        if (!send.reset) {
            selects = [];
            $scope.selects.forEach(function (block) {
                selects.push($scope.blocks.indexOf(block))
            });
        } else
            $scope.resetShapes();
        $scope.name = send.name;
        $scope.blocks = send.blocks;
        $scope.discovered = send.discovered;
        $scope.players = send.players;
        if (!send.reset)
            selects.forEach(function (i) {
                blockSelect(i);
            });
        sortPlayers();
        $scope.$apply();
        function blockSelect(i) {
            $scope.selectBlock($scope.blocks[i]);
        }
    });

    socket.on('checkgame.players', function (players) {
        $scope.players = players;
        players.forEach(function (p) {
            if (p.sid != user.sid)
                return;
            $scope.player = p;
        });
        $scope.$apply();
    });



    var chat = document.querySelector('.chat-window');
    socket.on('checkgame.chat', function (message) {
        message.date = new Date();
        $scope.messages.push(message);
        $scope.$apply();
        $timeout(function () {
            chat.scrollTop = chat.scrollHeight;
        });
    });

    function sortPlayers() {
        $scope.players.forEach(function (p) {
            if (p.sid == user.sid) {
                $scope.player = p;
            }
        });
    }

});
