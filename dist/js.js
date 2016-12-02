Array.prototype.contains = function (item) {
    return this.indexOf(item) != -1;
};


Array.prototype.remove = function (val, con) {
    if (con)
        if (!confirm('삭제하시겠습니까?'))
            return;
    this.splice(this.indexOf(val), 1);
};

Array.prototype.toggle = function (item) {
    if (this.contains(item)) {
        this.remove(item);
        return;
    }
    this.push(item);
};

String.prototype.toDateString = function () {
    return new Date(this.toString()).toString();
};
Date.prototype.toDateString = function () {
    return this.toString();
};


Date.prototype.toAmPm = function () {
    var hours = this.getHours();
    var minutes = this.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ampm;
};

Date.prototype.toString = function () {
    var month = '' + (this.getMonth() + 1),
        day = '' + this.getDate(),
        year = this.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    var date = [year, month, day].join('.');
    return date + " " + this.toAmPm();
};

String.prototype.newLine = function () {
    return this.replace(/\n/g, '<br>');
};

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-67266885-1', 'auto');

var app = angular.module('resume', ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAnimate']);
app.scope = {};
app.run(function ($rootScope, $location, $window) {
    $rootScope
        .$on('$stateChangeSuccess',
        function (event) {
            if (!$window.ga)
                return;
            $window.ga('send', 'pageview', {page: $location.path()});
        });
});


app.config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('main', {
            url: "/",
            controller: "main",
            templateUrl: "/dist/pages/main/main.html",
            onEnter: function (socket) {
                socket.emit('getGameList');
            }
        })
        .state('check', {
            url: "/check/:id",
            controller: "check",
            templateUrl: "/dist/pages/check/check.html",
            onEnter: function (socket, $stateParams) {
                leaveRoom(socket);
                socket.emit('join', {type: 'check', id: $stateParams.id});
            }
        })
        .state('seven', {
            url: "/seven/:id",
            controller: "seven",
            templateUrl: "/dist/pages/seven/seven.html",
            onEnter: function (socket, $stateParams) {
                leaveRoom(socket);
                socket.emit('join', {type: 'seven', id: $stateParams.id});
            }
        })
        .state('numberchess', {
            url: "/numberchess/:id",
            controller: "numberchess",
            templateUrl: "/dist/pages/numberchess/numberchess.html",
            onEnter: function (socket, $stateParams) {
                leaveRoom(socket);
            }
        })
        .state('sabotage', {
            url: "/sabotage/:id",
            controller: "sabotage",
            templateUrl: "/dist/pages/sabotage/sabotage.html",
            onEnter: function (socket, $stateParams) {
                leaveRoom(socket);
            }
        })
        .state('profile', {
            url: "/profile",
            controller: "profile",
            templateUrl: "/dist/pages/profile/profile.html",
            onEnter: leaveRoom
        })
        .state('board', {
            url: "/board",
            controller: "board",
            templateUrl: "/dist/pages/board/board.html",
            onEnter: leaveRoom
        });

    function leaveRoom(socket) {
        socket.emit('leave');
    }

});
app.directive('card', function () {
    return {
        restrict: 'E',
        templateUrl: '/dist/directives/card/card.html',
        scope: {
            front: '=',
            back: '='
        },
        controller: function ($scope) {
            var icon = $scope.icon = {};
            icon.e = 'fa fa-eye';
            icon.x = 'fa fa-ban';
            var description = $scope.description = {};
            description[0] = "X카드가 없고, 승자가 없을 경우 포인트를 나눠가집니다.";
            description[1] = "이 카드로 승리하면 추가로 칩을 하나씩 더 받습니다.";
            description[2] = "이 카드로 승리하면 추가로 칩을 하나씩 더 받습니다.";
            description[3] = "이 카드로 승리하면 추가로 칩을 하나씩 더 받습니다.";
            description['e'] = "다른 사람의 카드를 확인한 후 카드를 냅니다.";
            description['x'] = "아무도 승리하지 못합니다.";
        }
    }
});
app.directive('chat', function () {
    return {
        restrict: 'E',
        templateUrl: '/dist/directives/chat/chat.html',
        scope: {player: '=', setTo: '='},
        controller: function ($scope, socket, $timeout) {
            var chat = document.querySelector('.chat-window');
            var messages = $scope.messages = [];

            $scope.setTo = function (p) {
                if (p.sid == $scope.player.sid)
                    return;
                if (!$scope.message)
                    $scope.message = {};
                $scope.message.to = p;
            };

            socket.on('chat', function (message) {
                $scope.messages.push(message);
                $scope.$apply();
                $timeout(function () {
                    chat.scrollTop = chat.scrollHeight;
                });
            });

            $scope.send = function (message) {
                if (message.message == undefined || message.message == '')
                    return;
                $scope.message = {};
                $scope.message.to = message.to;
                message.date = new Date();
                socket.emit('chat', message);
                if (!message.to)
                    return;
                message.from = message.to;
                message.fromme = true;
                messages.push(message);
                $timeout(function () {
                    chat.scrollTop = chat.scrollHeight;
                });
            };
        }
    }
});
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
app.directive('ngRegex', function ($compile) {
    return {
        restrict: 'A',
        scope: {ngModel: '='},
        link: function (scope, element, attrs) {
            var message = angular.element("<span class='message' ng-show='!matched && ngModel!=undefined && ngModel.length != 0'>" + attrs.message + '</span>');
            $compile(message)(scope);

            element[0].parentNode.insertBefore(message[0], element[0].nextSibling);
            var parent = scope.$parent;
            var regex = parent[attrs.ngRegex];

            if (regex == undefined)
                regex = new RegExp(attrs.ngRegex);

            var regexTest = function () {
                return regex.test(parent.$eval(attrs.ngModel));
            };

            parent.$watch(attrs.ngModel, function () {
                if (parent.$eval(attrs.ngModel) == undefined || parent.$eval(attrs.ngModel) == "") {
                    setRegex(false, true);
                    return;
                }
                if (regexTest()) {
                    setRegex(true);
                    return;
                }
                setRegex(false);

                function setRegex(val, not) {
                    scope.matched = val;
                    if (!val && !not)
                        element.addClass('waring');
                    else
                        element.removeClass('waring');

                    if (parent.ngRegex == undefined)
                        parent.ngRegex = {};
                    parent.ngRegex[attrs.ngModel] = val;
                }
            });
        }
    }
});
(function () {
    /*!
     Autosize 3.0.9
     license: MIT
     http://www.jacklmoore.com/autosize
     */
    (function (global, factory) {
        if (typeof define === 'function' && define.amd) {
            define(['exports', 'module'], factory);
        } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
            factory(exports, module);
        } else {
            var mod = {
                exports: {}
            };
            factory(mod.exports, mod);
            global.autosize = mod.exports;
        }
    })(this, function (exports, module) {
        'use strict';

        function assign(ta) {
            var _ref = arguments[1] === undefined ? {} : arguments[1];

            var _ref$setOverflowX = _ref.setOverflowX;
            var setOverflowX = _ref$setOverflowX === undefined ? true : _ref$setOverflowX;
            var _ref$setOverflowY = _ref.setOverflowY;
            var setOverflowY = _ref$setOverflowY === undefined ? true : _ref$setOverflowY;

            if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || ta.hasAttribute('data-autosize-on')) return;

            var heightOffset = null;
            var overflowY = 'hidden';

            function init() {
                var style = window.getComputedStyle(ta, null);

                if (style.resize === 'vertical') {
                    ta.style.resize = 'none';
                } else if (style.resize === 'both') {
                    ta.style.resize = 'horizontal';
                }

                if (style.boxSizing === 'content-box') {
                    heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
                } else {
                    heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
                }
                // Fix when a textarea is not on document body and heightOffset is Not a Number
                if (isNaN(heightOffset)) {
                    heightOffset = 0;
                }

                update();
            }

            function changeOverflow(value) {
                {
                    // Chrome/Safari-specific fix:
                    // When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
                    // made available by removing the scrollbar. The following forces the necessary text reflow.
                    var width = ta.style.width;
                    ta.style.width = '0px';
                    // Force reflow:
                    /* jshint ignore:start */
                    ta.offsetWidth;
                    /* jshint ignore:end */
                    ta.style.width = width;
                }

                overflowY = value;

                if (setOverflowY) {
                    ta.style.overflowY = value;
                }

                resize();
            }

            function resize() {
                var htmlTop = window.pageYOffset;
                var bodyTop = document.body.scrollTop;
                var originalHeight = ta.style.height;

                ta.style.height = 'auto';

                var endHeight = ta.scrollHeight + heightOffset;

                if (ta.scrollHeight === 0) {
                    // If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
                    ta.style.height = originalHeight;
                    return;
                }

                ta.style.height = endHeight + 'px';

                // prevents scroll-position jumping
                document.documentElement.scrollTop = htmlTop;
                document.body.scrollTop = bodyTop;
            }

            function update() {
                var startHeight = ta.style.height;

                resize();

                var style = window.getComputedStyle(ta, null);

                if (style.height !== ta.style.height) {
                    if (overflowY !== 'visible') {
                        changeOverflow('visible');
                    }
                } else {
                    if (overflowY !== 'hidden') {
                        changeOverflow('hidden');
                    }
                }

                if (startHeight !== ta.style.height) {
                    var evt = document.createEvent('Event');
                    evt.initEvent('autosize:resized', true, false);
                    ta.dispatchEvent(evt);
                }
            }

            var destroy = (function (style) {
                window.removeEventListener('resize', update);
                ta.removeEventListener('input', update);
                ta.removeEventListener('keyup', update);
                ta.removeAttribute('data-autosize-on');
                ta.removeEventListener('autosize:destroy', destroy);

                Object.keys(style).forEach(function (key) {
                    ta.style[key] = style[key];
                });
            }).bind(ta, {
                    height: ta.style.height,
                    resize: ta.style.resize,
                    overflowY: ta.style.overflowY,
                    overflowX: ta.style.overflowX,
                    wordWrap: ta.style.wordWrap
                });

            ta.addEventListener('autosize:destroy', destroy);

            // IE9 does not fire onpropertychange or oninput for deletions,
            // so binding to onkeyup to catch most of those events.
            // There is no way that I know of to detect something like 'cut' in IE9.
            if ('onpropertychange' in ta && 'oninput' in ta) {
                ta.addEventListener('keyup', update);
            }

            window.addEventListener('resize', update);
            ta.addEventListener('input', update);
            ta.addEventListener('autosize:update', update);
            ta.setAttribute('data-autosize-on', true);

            if (setOverflowY) {
                ta.style.overflowY = 'hidden';
            }
            if (setOverflowX) {
                ta.style.overflowX = 'hidden';
                ta.style.wordWrap = 'break-word';
            }

            init();
        }

        function destroy(ta) {
            if (!(ta && ta.nodeName && ta.nodeName === 'TEXTAREA')) return;
            var evt = document.createEvent('Event');
            evt.initEvent('autosize:destroy', true, false);
            ta.dispatchEvent(evt);
        }

        function update(ta) {
            if (!(ta && ta.nodeName && ta.nodeName === 'TEXTAREA')) return;
            var evt = document.createEvent('Event');
            evt.initEvent('autosize:update', true, false);
            ta.dispatchEvent(evt);
        }

        var autosize = null;

        // Do nothing in Node.js environment and IE8 (or lower)
        if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
            autosize = function (el) {
                return el;
            };
            autosize.destroy = function (el) {
                return el;
            };
            autosize.update = function (el) {
                return el;
            };
        } else {
            autosize = function (el, options) {
                if (el) {
                    Array.prototype.forEach.call(el.length ? el : [el], function (x) {
                        return assign(x, options);
                    });
                }
                return el;
            };
            autosize.destroy = function (el) {
                if (el) {
                    Array.prototype.forEach.call(el.length ? el : [el], destroy);
                }
                return el;
            };
            autosize.update = function (el) {
                if (el) {
                    Array.prototype.forEach.call(el.length ? el : [el], update);
                }
                return el;
            };
        }

        module.exports = autosize;
    });
    app.directive('textarea', function () {
        return {
            restrict: 'E',
            link: function (scope, element, attributes) {
                autosize(element);
            }
        }
    });
})();
app.controller('nav', function (user, $scope, req, alert) {
    $scope.user = user;
    $scope.logout = function () {
        req.get('/api/logout').success(function () {
            location.reload();
        });
    };

    $scope.mailRequest = function () {
        var email = prompt("메일주소는요?");
        if (!/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(email)) {
            alert("메일주소를 잘못입력하셨습니다.");
            return;
        }
        req.get('/api/password', {email: email}).success(function (res) {
            if (res.error) {
                alert(res.error, false, 2500);
                return;
            }
            alert("메일이 발송되었습니다.", true, 2500);
        });
    };
});
app.controller('board', function (user, $scope, req) {
    $scope.articles = [];
    $scope.article = new Article();

    $scope.info = {
        limit: 10,
        page: 0
    };

    $scope.get = function () {
        req.get('/api/article', $scope.info).success(function (res) {
            $scope.articles = $scope.articles.concat(res);
            $scope.info.page++;
        });
    };

    $scope.get();

    $scope.new = 0;

    $scope.submit = function () {
        if ($scope.article.text == '')
            return;
        req.post('/api/article', $scope.article).success(function (res) {
            if (res.err) {
                alert(res.err);
                return;
            }
            angular.copy(res, $scope.article);
            $scope.articles.unshift($scope.article);
            $scope.article = new Article();
            $scope.new++;
        });
    };

    $scope.delete = function (article) {
        if (!confirm("삭제하시겠습니까?"))
            return;
        req.post('/api/article/delete', {_id: article._id, user: user.email}).success(function (res) {
            if (res.err) {
                alert(res.err);
                return;
            }
            $scope.articles.remove(article);
        });
    };

    function Article() {
        this.type = 'alert-success';
        this.align = 'left';
        this.date = new Date();
        this.user = user;
        this.text = '';
    }

    $scope.user = user;

});
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

app.controller('main', function ($scope, socket) {



    $scope.skills = ['JAVA', 'Javascript', 'AngularJS', 'NodeJS', 'Spring MVC', 'Java WebServlet', 'MongoDB', 'Mysql', 'Redis', 'Less', 'Css3', 'Html5', 'SocketIO', 'NginX'];

});
app.controller('numberchess', function ($scope) {

    $scope.board = [];
    for (var i = 0; i < 9; i++)
        $scope.board.push([{}, {}, {}, {}, {}, {}]);

    $scope.units = [];
    for (var i = 1; i < 10; i++)
        $scope.units.push(new Unit(i))
    $scope.units.push(new Unit('bomb'));
    $scope.units.push(new Unit('bomb'));
    $scope.units.push(new Unit('bomb'));
    $scope.units.push(new Unit('king'));


    $scope.here = function (position) {
        if ($scope.selected == undefined)
            return;
        var tmp = position.unit;
        $scope.units.remove($scope.selected);
        position.unit = $scope.selected;
        if (tmp != undefined) {
            $scope.units.push(tmp);
        }
        $scope.selected = undefined;
    };


    $scope.select = function (unit) {
        $scope.selected = unit;
    };


    function Unit(val) {
        this.value = val;
    }

});
app.controller('profile', function (user, $scope, req, alert) {
    $scope.user = user;

    $scope.updateUser = function () {
        req.put('/api/user', user).success(function (res) {
            alert(res);
        });
    }

});
app.controller('sabotage', function ($scope) {


    var cards = $scope.cards = [];
    for (var i = 0; i < 6; i++)
        cards.push(allPath());
    for (i = 0; i < 5; i++)
        cards.push(leftDown());
    for (i = 0; i < 4; i++)
        cards.push(rightDown());
    for (i = 0; i < 5; i++)
        cards.push(upRightDown());
    for (i = 0; i < 5; i++)
        cards.push(leftRightDown());
    for (i = 0; i < 4; i++)
        cards.push(upDown());
    for (i = 0; i < 3; i++)
        cards.push(leftRight());
    var card = allPath();
    card.center = false;
    cards.push(card);
    card = leftDown();
    card.center = false;
    cards.push(card);
    card = leftRightDown();
    card.center = false;
    cards.push(card);
    card = upRightDown();
    card.center = false;
    cards.push(card);
    card = rightDown();
    card.center = false;
    cards.push(card);
    card = upDown();
    card.center = false;
    cards.push(card);
    card = leftRight();
    card.center = false;
    cards.push(card);
    card = new PathCard();
    card.down = true;
    cards.push(card);
    card = new PathCard();
    card.left = true;
    cards.push(card);

    //목적지 카드
    card = allPath();
    card.dest = true;
    card.gold = true;
    card = leftDown();
    card.dest = true;
    card = rightDown;
    card.dest = true;

    ////아이템 카드
    //for (i = 0; i < 6; i++)
    //    cards.push(map());
    //for (i = 0; i < 3; i++)
    //    cards.push(cartDestroy());
    //for (i = 0; i < 3; i++)
    //    cards.push(spadeDestroy());
    //for (i = 0; i < 3; i++)
    //    cards.push(lightDestroy());
    //for (i = 0; i < 2; i++)
    //    cards.push(cart());
    //for (i = 0; i < 2; i++)
    //    cards.push(spade());
    //for (i = 0; i < 2; i++)
    //    cards.push(light());
    //for (i = 0; i < 1; i++)
    //    cards.push(cartOrLight());
    //for (i = 0; i < 1; i++)
    //    cards.push(cardOrSpade());
    //for (i = 0; i < 1; i++)
    //    cards.push(lightOrSpade());
    //for (i = 0; i < 3; i++)
    //    cards.push(pathDestroy());



    function allPath() {
        var card = new PathCard();
        card.left = true;
        card.right = true;
        card.down = true;
        card.up = true;
        card.center = true;
        return card;
    }

    function leftDown() {
        var card = new PathCard();
        card.left = true;
        card.down = true;
        card.center = true;
        return card;
    }

    function rightDown() {
        var card = new PathCard();
        card.right = true;
        card.down = true;
        card.center = true;
        return card;
    }

    function upRightDown() {
        var card = new PathCard();
        card.right = true;
        card.down = true;
        card.up = true;
        card.center = true;
        return card;
    }

    function leftRightDown() {
        var card = new PathCard();
        card.left = true;
        card.right = true;
        card.down = true;
        card.center = true;
        return card;
    }

    function upDown() {
        var card = new PathCard();
        card.down = true;
        card.up = true;
        card.center = true;
        return card;
    }

    function leftRight() {
        var card = new PathCard();
        card.left = true;
        card.right = true;
        card.center = true;
        return card;
    }


    function PathCard() {
    }

});
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
app.controller('login', function ($scope, req, alert, popup, user) {

    $scope.user = user;

    $scope.mailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    $scope.register = function () {
        req.post('/api/user', user).success(function (res) {
            if (res.error) {
                alert("이메일 형식이 맞지 않거나 이미 가입한 이메일입니다.");
                return;
            }
            alert("가입되었습니다.");
            popup('login', true);
        });
    };

    $scope.login = function () {
        req.post('/api/user/login', {email: user.email, password: user.password}).success(function (res) {
            if (res.error) {
                alert(res.error);
                return;
            }
            alert("로그인 되었습니다.");
            location.reload();
        });
    };

});
(function () {
    var scope;
    var pop;
    app.factory('popup', function () {
        var popup = {};
        pop = function (val, param) {
            popup.show = true;
            popup.state = val;
            scope.param = param;
            if (!scope.$$phase)
                scope.$apply();
        };
        pop.isShow = function () {
            return popup.show;
        };
        pop.getState = function () {
            return popup.state;
        };
        pop.hide = function () {
            popup.show = false;
        };
        return pop;
    });

    app.directive('popup', function () {
        return {
            restrict: 'A',
            link: function (s, e, a) {
                e.bind('click', function () {
                    var params = a.popup.split(',');
                    pop(params[0], params[1]);
                });
            }
        }
    });

    app.controller('popup', function ($scope, popup, socket) {
        scope = $scope;
        $scope.url = {};
        $scope.url.login = '/dist/popup/login/login.html';
        $scope.url.register = '/dist/popup/login/register.html';
        $scope.url.rooms = '/dist/popup/rooms/rooms.html';

        $scope.classes = {};
        $scope.classes.login = $scope.classes.register = $scope.classes.license = 'window-s';
        $scope.classes.rooms = 'window-s';
        $scope.popup = popup;


    });

})();
app.controller('rooms', function (socket, $scope, $state, popup) {

    $scope.move = function (room) {
        $state.go($scope.param, {id: room});
        popup.hide();
    };
});
    
(function () {
    var scope;
    app.controller('alert', function ($scope, socket, alert) {
        scope = $scope;
        $scope.alerts = [];
    });
    app.factory('alert', function ($timeout, socket) {
        var alert = function (message, success, duration) {
            if (!duration) {
                duration = 3000;
                $timeout.cancel(this.hide);
            }
            this.hide = $timeout(function () {
                scope.showing = false;
            }, duration);
            var al = {alert: message, date: new Date(), success: success};
            scope.alerts.push(al);
            $timeout(function () {
                scope.alerts.remove(al);
            }, duration);
            scope.alert = al;
            scope.showing = true;
            if (!scope.$$phase) {
                scope.$apply();
            }
        };

        socket.on('alert', function (message) {
            alert(message.message, !message.fail, message.duration);
        });

        alert.getAlerts = function () {
            return scope.alerts;
        };
        return alert;
    });
})();
app.factory('req', function ($http) {
    var req = $http;
    req.get = function (url, data) {
        if (data != undefined) {
            url += "?";
            url += parse(data);
        }
        function parse(obj) {
            var str = [];
            for (var p in obj)
                str.push(encodeURIComponent(p) + "="
                    + encodeURIComponent(obj[p]));
            return str.join("&");
        }

        return $http({
            method: "GET",
            url: url
        });
    };
    return req;
});

app.factory('socket', function (user, $state, $timeout) {
    var socket = io('/', {path: '/socket.io', 'multiplex': false});

    var yo = false;
    console.log('yo start');
    socket.on('connect', function () {
        console.log('yo received');
        yo = true;
    });
    yelling();

    function yelling() {
        console.log('yo');
        if (yo)
            return;
        socket.disconnect();
        socket.connect('/', {path: '/socket.io', 'multiplex': false});
        $timeout(yelling, 1000);
    }

    socket.on('redirect', function (send) {
        if (send.message)
            alert(send.message);
        $state.go(send.state, send.params);
    });

    var on = socket.on.bind(socket);
    var events = {};

    socket.on = function (name, fn) {
        if (events[name]) {
            socket.removeListener(name, events[name]);
        }
        on(name, fn);
        events[name] = fn;
    };

    return socket;
});
app.factory('user', function (req) {
    var user = {};
    req.get('/api/user/session').success(function (res) {
        if (!res.user)
            return;
        angular.copy(res.user, user);
        if (!res.user.email)
            return;
        user.logged = true;
    });
    return user;
});
app.controller('wrap', function ($scope, socket) {
    socket.on('highest', function (highest) {
        $scope.highest = highest;
        $scope.$apply();
    });

    socket.on('gameList', function (list) {
        $scope.list = list;
        $scope.$apply();
    });
});