app.controller('seven', function ($scope, socket, user, alert, $window, $timeout, $stateParams) {

    $scope.logs = [];

    var bluechips = $scope.bluechips = [];
    var blackchips = $scope.blackchips = [];

    $scope.$watch('game.point', function (point) {
        $scope.compute(point);
    });

    $scope.roomId = $stateParams.id;

    $scope.prompt = function (val) {
        window.prompt("URL", "http://picks.be/check/" + val);
    };

    var bp = 5;
    $scope.compute = function (point) {
        var chips = getPoint();
        if (point < chips) {
            $scope.win = false;
            bluechips = $scope.bluechips = [];
            blackchips = $scope.blackchips = [];
            chips = 0;
        }
        for (var i = chips; i < point; i++)
            bluechips.push(i);
        function changeChips() {
            if (bluechips.length < 10)
                return;
            for (var i = 0; i < bp; i++)
                bluechips.splice(bluechips.length - 1, 1);
            blackchips.push(blackchips.length);
            changeChips();
        }

        function getPoint() {
            return bluechips.length + blackchips.length * bp;
        }
    };


    $scope.$watch('player.in', function (val) {
        if (val == undefined)
            return;
        socket.emit('sevengame.in', val);
    }, true);

    $scope.submit = function (i) {
        socket.emit('sevengame.submit', i);
    };

    function sortPlayers() {
        $scope.inPlayers = [];
        $scope.players.forEach(function (p) {
            if (p.sid == user.sid) {
                $scope.player = p;
                return;
            }
            if (p.playing) {
                $scope.inPlayers.push(p);
            }
        });
        $scope.inPlayers.forEach(function (p) {
            $scope.players.remove(p);
        });
        if ($scope.player.playing)
            $scope.players.remove($scope.player);
    }

    var dek = document.querySelector('.card-dek');
    var width = dek.offsetWidth;
    angular.element($window).bind('resize', function () {
        if (dek == null)
            return;
        width = dek.offsetWidth;
        $scope.$apply();
    });


    $scope.cardStyle = function (index) {
        var result = {};
        if (!$scope.player)
            return;
        var def = index / $scope.player.cards.length;
        result.left = width * def - 11;
        result.left += 'px';
        var degree = (30 * def - 13.5);
        result.transform = "rotate(" + degree + "deg)";
        var x = (width / 2) - (width * def - 11) - 58;
        result.top = getTanDeg(degree) * x * (-1);
        result.top += 'px';
        return result;

        function getTanDeg(deg) {
            var rad = deg * Math.PI / 180;
            return Math.tan(rad);
        }
    };

    $scope.open = function (p) {
        if (p.submitted === true) {
            alert('패건들지 말어 손모가지 날아가붕게');
            return;
        }
        p.open = !p.open;
    };

    $scope.time = 0;
    function timerStart(val) {
        window.requestAnimationFrame(startTimer);
        var start;

        function startTimer(tick) {
            if (!start)
                start = val + tick;
            $scope.time = parseInt((start - tick) / 1000);
            $scope.$apply();
            if ($scope.time > 0)
                window.requestAnimationFrame(startTimer);
        }
    }


    socket.on('sevengame.time', function (time) {
        timerStart(time);
    });


    socket.on('sevengame.players', function (players) {
        $scope.players = players;
        sortPlayers();
        $scope.$apply();
    });

    socket.on('sevengame.alert', function (message) {
        $scope.logs.unshift(message);
        alert(message.message);
        $scope.$apply();
    });

    socket.on('sevengame.sync', function (state) {
        $scope.players = state.players;
        sortPlayers();
        $scope.game = state.game;
        $scope.$apply();
        if (!state.type)
            return;
        if (state.type == 'open') {
            open();
            return;
        }
        if (state.type.winner)
            singleWin(state.type.winner);
        if (state.type.winners)
            zeroWin(state.type.winner);
    });


    function zeroWin(winners) {
        var name = "";
        winners.forEach(function (winner) {
            name += winner.name + " ";
        });

        var message = name + "님이 0으로 승리하셨습니다.";
        message += "칩을 나눠 가져갑니다.";
        alert(message);
    }

    function singleWin(winner) {
        if (winner == $scope.player.sid) {
            $scope.win = true;
            alert("이겼습니다! 칩을 가져옵니다.");
            return;
        }
        $scope.win = false;
        winner = getWinner(winner);
        var message = winner.name + "님이 " + winner.submitted + "(으)로 승리하셨습니다.";
        if (winner.submitted < 4 && winner.submitted != 0)
            message += "칩과 추가 칩을 가져갑니다.";
        else
            message += "칩을 가져갑니다.";
        alert(message);

        function getWinner(sid) {
            for (var i = 0; i < $scope.inPlayers.length; i++) {
                if ($scope.inPlayers[i].sid == sid)
                    return $scope.inPlayers[i];
            }
        }
    }


    function open() {
        alert('준비됐어? 까보까? <br> 자 지금부터 확인들어 가것습니다이');
        var i = 0;
        open(i, 800);
        function open(I, delay) {
            if (i == $scope.inPlayers.length)
                return;
            $timeout(function () {
                $scope.inPlayers[i].open = true;
                i++;
                open(i, delay);
                $scope.$apply();
            }, delay);
        }
    }

});