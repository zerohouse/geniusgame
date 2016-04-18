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