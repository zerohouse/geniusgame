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