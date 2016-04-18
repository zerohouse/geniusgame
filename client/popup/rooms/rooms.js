app.controller('rooms', function (socket, $scope, $state, popup) {

    $scope.move = function (room) {
        $state.go($scope.param, {id: room});
        popup.hide();
    };
});
    