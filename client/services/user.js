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