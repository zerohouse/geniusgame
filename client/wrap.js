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