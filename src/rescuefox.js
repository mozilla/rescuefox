function() {

var Game = function( options ) {

    var engine = options.engine;

    var Ship = function( options ) {
    };
    Ship.prototype = new engine.Entity();
    Ship.constructor = Ship;

    var Asteroid = function( options ) {
    };
    Asteroid.prototype = new engine.Entity();
    Asteroid.constructor = Asteroid;

    var Fox = function( options ) {
    };
    Fox.prototype = new engine.Entity();
    Fox.constructor = Fox;

    var scene = new engine.Scene();

    this.run = function() {
        engine.run();
    };

}

document.addEventListener( 'DOMContentLoaded', function( event ) {
    paladin.create( { debug: true },
        function( engineInstance ) {
            var game = new Game( { engine: engineInstance } );
            game.run();   
        }
    } );
}, false );

}();
