var chai = require('chai');
var expect = chai.expect;
var Game = require('./game.js');

describe('newGame', function () {
    var g = new Game();
    g.blocks =
        [{color: 2, shape: 1, back: 2},
            {color: 0, shape: 1, back: 0},
            {color: 2, shape: 1, back: 0},
            {color: 1, shape: 2, back: 1},
            {color: 1, shape: 1, back: 0},
            {color: 2, shape: 1, back: 2},
            {color: 0, shape: 0, back: 2},
            {color: 0, shape: 1, back: 1},
            {color: 1, shape: 0, back: 1}];
    g.getAllResults();

    it('not exist', function () {
        expect(g.check([])).to.equal(false);
    });

    it('not exist', function () {
        expect(g.check([4, 1, 7])).to.equal(false);
    });

    it('ok', function () {
        expect(g.check([4, 0, 7])).to.equal(true);
    });

    it('not done', function () {
        expect(g.done()).to.equal(false);
    });
});