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