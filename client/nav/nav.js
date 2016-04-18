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