/*global paladin */
(function() {

var Game = function( options ) {

    var engine = options.engine;

    var asteroidCollada = engine.graphics.CubicVR.loadCollada("../assets/asteroids/asteroids1.dae","../assets/asteroids/"),
        asteroidMeshes = [
            asteroidCollada.getSceneObject( "asteroid1" ).getMesh().clean(),
            asteroidCollada.getSceneObject( "asteroid2" ).getMesh().clean(),
            asteroidCollada.getSceneObject( "asteroid3" ).getMesh().clean()
        ],
        asteroidHulls = [
            asteroidCollada.getSceneObject( "asteroid1hull" ).getMesh(),
            asteroidCollada.getSceneObject( "asteroid2hull" ).getMesh(),
            asteroidCollada.getSceneObject( "asteroid3hull" ).getMesh()
        ];

    var Asteroid = function( options ) {
        var entity = this.entity = new engine.Entity();

        var asteroidMesh = asteroidMeshes[ Math.floor( Math.random() * asteroidMeshes.length ) ];
        var model = new engine.component.Model({
            mesh: asteroidMesh
        });

        entity.addComponent( model );

        this.spatial = entity.spatial;
        this.setParent = entity.setParent;
    };

    var scene = new engine.Scene();
    scene.graphics.setSkyBox(new engine.graphics.CubicVR.SkyBox({
      texture: "../assets/space_skybox.jpg"
    }));

    // Run the game.
    this.run = function() {
        engine.run();
        var asteroids = [];
        for ( var i=0; i<10; ++i ) {
            var asteroid = new Asteroid();
            asteroid.spatial.position[0] = -20 + Math.random() * 50;
            asteroid.spatial.position[1] = -2 + Math.random() * 4;
            asteroid.spatial.position[2] = -20 + Math.random() * 50;
            asteroid.setParent( scene );
            asteroids.push( asteroid );
        }
        var mvc = new CubicVR.MouseViewController(CubicVR.getCanvas(), scene.graphics.camera);
    };

    engine.sound.Track.load({
        url: "../assets/music/perfect-blind-ethernion-ii.ogg",
        callback: function( track ) {
            engine.sound.music.add( 'bg-music', track );
            engine.sound.music.play( 'bg-music' );
        }
    });
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
