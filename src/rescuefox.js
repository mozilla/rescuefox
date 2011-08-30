/*global paladin */
(function() {

var Game = function( options ) {

    var engine = options.engine;

    var Ship = function( options ) {
    };
    Ship.prototype = new engine.Entity();
    Ship.constructor = Ship;

    var asteroidMesh = CubicVR.loadCollada("../assets/asteroids/asteroids1.dae","../assets/asteroids/");
    var Asteroid = function( options ) {
        var model = new engine.component.Model({
            mesh: asteroidMesh
        });
        this.addComponent( model );
    };
    Asteroid.prototype = new engine.Entity();
    Asteroid.constructor = Asteroid;

    var Fox = function( options ) {
    };
    Fox.prototype = new engine.Entity();
    Fox.constructor = Fox;

    var scene = new engine.Scene();
    scene.graphics.setSkyBox(new engine.graphics.CubicVR.SkyBox({
      texture: "../assets/space_skybox.jpg"
    }));

    this.run = function() {
        engine.run();
        for ( var i=0; i<10; ++i ) {
            var asteroid = new Asteroid();
            asteroid.spatial.position[0] = -250 + Math.random()*500;
            asteroid.spatial.position[1] = -2 + Math.random()*4;
            asteroid.spatial.position[2] = -250 + Math.random()*500;
            asteroid.setParent( scene );
        }
    };
};

document.addEventListener( 'DOMContentLoaded', function( event ) {
    paladin.create( { debug: true },
        function( engineInstance ) {
            var game = new Game( { engine: engineInstance } );
            game.run();
        }
    );
}, false );

})();
