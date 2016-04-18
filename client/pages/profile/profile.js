app.controller('profile', function (user, $scope, req, alert) {
    $scope.user = user;

    $scope.updateUser = function () {
        req.put('/api/user', user).success(function (res) {
            alert(res);
        });
    }

});