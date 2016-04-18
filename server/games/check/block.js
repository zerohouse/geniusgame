var Block = function (color, shape, back) {
    this.color = color;
    this.shape = shape;
    this.back = back;
};

Block.random = function () {
    var result = [];
    for (var i = 0; i < 3; i++)
        for (var j = 0; j < 3; j++)
            for (var k = 0; k < 3; k++)
                result.push([i, j, k]);

    var blocks = [];
    for (var l = 0; l < 9; l++) {
        var ran = result.splice(parseInt(Math.random() * result.length), 1)[0];
        blocks.push(new Block(ran[0], ran[1], ran[2]));
    }
    return blocks;

    function ranInt(val) {
        return parseInt(Math.random() * val);
    }
};

module.exports = Block;