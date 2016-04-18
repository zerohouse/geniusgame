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