/*global console,paladin */
(function() {

	var Game = function( options ) {

		var engine = options.engine;
		var CubicVR = engine.graphics.CubicVR;

    // Specify a different number of asteroids via index.html?# on the url, or use default
		var spawnObjs = (window.location.search.substr(1) | 0) || 100;

    var cameraOffset = [ 0, 2, 4 ];

		var generateObjects = function() {
			var result = [];

			var asteroidModels = CubicVR.loadCollada("../assets/asteroids/asteroids1.dae","../assets/asteroids");
			
			var asteroid1 = asteroidModels.getSceneObject("asteroid1").getMesh().clean();
			var asteroid2 = asteroidModels.getSceneObject("asteroid2").getMesh().clean();
			var asteroid3 = asteroidModels.getSceneObject("asteroid3").getMesh().clean();
			var asteroid4 = asteroidModels.getSceneObject("asteroid4").getMesh().clean();
			
			// keep model data for these ones.. (no clean)
			var asteroid1hull = asteroidModels.getSceneObject("asteroid1hull").getMesh();
			var asteroid2hull = asteroidModels.getSceneObject("asteroid2hull").getMesh();
			var asteroid3hull = asteroidModels.getSceneObject("asteroid3hull").getMesh();
			var asteroid4hull = asteroidModels.getSceneObject("asteroid4hull").getMesh();
			
			var envTex =  new CubicVR.Texture("../assets/fract_reflections.jpg");

			var sphereMesh = CubicVR.primitives.sphere({
				radius: 1,
				lat: 24,
				lon: 24
			});

			var cylinderMesh = CubicVR.primitives.cylinder({
				radius: 1.0,
				height: 2,
				lon: 24
			});


			var capsuleMesh = new CubicVR.Mesh();
			capsuleMesh.booleanAdd(cylinderMesh);
			capsuleMesh.booleanAdd(sphereMesh,(new CubicVR.Transform()).translate([0,1,0]));
			capsuleMesh.booleanAdd(sphereMesh,(new CubicVR.Transform()).translate([0,-1,0]));

			capsuleMesh.prepare();

			var capsuleCollision = new CubicVR.CollisionMap({
				type: CubicVR.enums.collision.shape.CAPSULE,
				radius: 1,
				height: 2,
				restitution:0
			});

			var asteroid1Collision = new CubicVR.CollisionMap({
				type: CubicVR.enums.collision.shape.CONVEX_HULL,
				mesh: asteroid1hull,
				restitution:0
			});

			var asteroid2Collision = new CubicVR.CollisionMap({
				type: CubicVR.enums.collision.shape.CONVEX_HULL,
				mesh: asteroid2hull,
				restitution:0
			});

			var asteroid3Collision = new CubicVR.CollisionMap({
				type: CubicVR.enums.collision.shape.CONVEX_HULL,
				mesh: asteroid3hull,
				restitution:0                    
			});

			var asteroid4Collision = new CubicVR.CollisionMap({
				type: CubicVR.enums.collision.shape.CONVEX_HULL,
				mesh: asteroid4hull,
				restitution:0
			});

			result.push({mesh:capsuleMesh,collision:capsuleCollision});
			result.push({mesh:asteroid1,collision:asteroid1Collision});
			result.push({mesh:asteroid2,collision:asteroid2Collision});
			result.push({mesh:asteroid3,collision:asteroid3Collision});
			result.push({mesh:asteroid4,collision:asteroid4Collision});

			return result;
		};


		var spawnObjects = function (scene,physics,objlist) {

			var nobjs = objlist.length-1;

			for (var i = 0; i < spawnObjs; i++) {
				var src = objlist[i%nobjs+1];

//				var isStatic = (i%4 == 0);
//				var isStatic = false;
				var isStatic = (i%nobjs+1 == 4);

				var distFactor = isStatic?300:200;



				var sceneObj = new CubicVR.SceneObject({
					mesh:src.mesh,
					position:[(Math.random()-0.5)*2.0*distFactor,(Math.random()-0.5)*2*distFactor,(Math.random()-0.5)*2.0*distFactor],
					rotation:[Math.random()*360,Math.random()*360,Math.random()*360]
				});


				var rigidObj = new CubicVR.RigidBody({
					sceneObject:sceneObj, 
					properties: {
						type: (isStatic)?CubicVR.enums.physics.body.STATIC:CubicVR.enums.physics.body.DYNAMIC,
								mass: (isStatic)?0:((1 + (i % 3))*20),
										collision: src.collision                                                
					},
					impulse: isStatic?[0,0,0]:[(Math.random()-0.5)*100.0,(Math.random()-0.5)*100.0,(Math.random()-0.5)*100.0]                        
				});


				/*                    if (isStatic) {
                        sceneObj.getInstanceMaterials()[0].color = [1,0,0];                        
                    } else {
                        var cdrp = rigidObj.getMass()/80;
                        sceneObj.getInstanceMaterials()[0].color = [1-cdrp,1-cdrp,1];
                    }*/

				scene.bindSceneObject(sceneObj);
				physics.bindRigidBody(rigidObj);

			}
		};

		var setupPlayer = function (scene,physics,playerObj) {

			var astronautCollada = CubicVR.loadCollada("../assets/spacesuit-scene.dae","../assets/");
			var astronautMesh = astronautCollada.getSceneObject("astronaut").getMesh().clean();

			var sceneObj = new CubicVR.SceneObject({
				mesh: astronautMesh,
				position:[0,0,0],
				rotation:[0,0,0]
			});

			var rigidObj = new CubicVR.RigidBody(sceneObj, {
				type: CubicVR.enums.physics.body.DYNAMIC,
				mass: 0.1,
				collision: playerObj.collision
			});

			sceneObj.getInstanceMaterials()[0].color = [1,0,1];

			scene.bindSceneObject(sceneObj);
			physics.bindRigidBody(rigidObj);

//			rigidObj.setAngularFactor(0);

			return rigidObj;
		};
		
		

		//----------- SCENE INIT:START -------------

		CubicVR.setGlobalAmbient([0.3,0.3,0.4]);

		// New scene with our canvas dimensions and default camera with FOV 80
		var canvas = engine.graphics.getCanvas();
		var scene = new CubicVR.Scene(canvas.width, canvas.height, 80);

		// load skybox
		scene.setSkyBox(new CubicVR.SkyBox({texture:"../assets/space_skybox.jpg"}));

		// set initial camera position and target
		scene.camera.setClip(0.1,2000);

		// Add a simple directional light
		scene.bindLight(new CubicVR.Light({
			type: CubicVR.enums.light.type.DIRECTIONAL,
			specular: [1, 1, 1],
			direction: [0.5, -1, 0.5]
		}));

		// Create a shadowed area light, map resolution 2048
		// designed for shadowing larger areas than spotlights can provide
		// it represents a directional light with shadows.
//		scene.bindLight(new CubicVR.Light({
//		type:CubicVR.enums.light.type.AREA,
//		intensity:0.9,
//		mapRes:2048,  // 4096 ? 8192 ? ;)
//		areaCeiling:40,
//		areaFloor:-40,
//		areaAxis: [-2,-2], // specified in degrees east/west north/south
//		distance: 60
//		}));

//		CubicVR.setSoftShadows(true);
		
		var floorMaterial = new CubicVR.Material({
			specular:[0,0,0],
			shininess: 0.9,
			env_amount: 1.0,
			textures: {
				color:  new CubicVR.Texture("../assets/6583-diffuse.jpg")
			}
		});

		var floorMesh = CubicVR.primitives.box({
			size: 1.0,
			material: floorMaterial,
			uvmapper: {
				projectionMode: CubicVR.enums.uv.projection.CUBIC,
				scale: [0.05, 0.05, 0.05]
			}
		}).prepare();

		var floorObject = new CubicVR.SceneObject({
			mesh: floorMesh,
			scale: [100, 0.2, 100],
			position: [0, -5, 0]
		});

		floorObject.shadowCast = false;

		// init physics manager
		var physics = new CubicVR.ScenePhysics();

		physics.setGravity([0,0,0]);


		var rigidFloor = new CubicVR.RigidBody(floorObject, {
			type: CubicVR.enums.physics.body.STATIC,
			collision: {
				type: CubicVR.enums.collision.shape.BOX,
				size: floorObject.scale
			}
		});
		//              physics.bindRigidBody(rigidFloor);


		// Add SceneObject containing the mesh to the scene
//		scene.bindSceneObject(floorObject);

		// Add our scene to the window resize list
		CubicVR.addResizeable(scene);

		//----------- SCENE INIT:END -------------


		var objlist = generateObjects();		
		spawnObjects(scene,physics,objlist);
		
		var player = setupPlayer(scene,physics,objlist[0]);

//		scene.camera.position = [20,20,20];
//		scene.camera.setParent(player.getSceneObject());
//		scene.camera.setTargeted(false);

//		player.setAngularFactor(0);
		player.activate(true);
		player.getSceneObject().visible = true;


		//----------- LAYOUT:START -------------


		var layout = new CubicVR.Layout({
			width:canvas.width,
			height:canvas.height
		});

		var target1 = new CubicVR.View({
			width:50,
			height:50,
			blend:true,
			tint:[1.0,0.4,0],
			texture:new CubicVR.Texture('../assets/target.png')
		});

		var target2 = new CubicVR.View({
			width:50,
			height:50,
			blend:true,
			tint:[0,0.4,1],
			texture:new CubicVR.Texture('../assets/target.png')
		});

		layout.addSubview(target1);
		layout.addSubview(target2);

		target1.x = canvas.width/2-50;
		target1.y = canvas.height/2-50;
		//----------- LAYOUT:END -------------



		//----------- MOUSE EVENTS:START -------------
		var point1 = null, point2 = null;


		var pickDist = 0;
		var lastResult = false;
		var downPos;

    var zoom = 10;
    function zoomCamera() {
        var vec3 = CubicVR.vec3;
        scene.camera.position = vec3.add(scene.camera.target, vec3.multiply(vec3.normalize(vec3.subtract(scene.camera.position, scene.camera.target)), zoom));
    }

		// initialize a mouse view controller
		var mvc = new CubicVR.MouseViewController(canvas, scene.camera);

		mvc.setEvents({
			mouseMove: function (ctx, mpos, mdelta, keyState) {

				if (!ctx.mdown) return;

        var vec3 = CubicVR.vec3;
        var dv = vec3.subtract(scene.camera.target, scene.camera.position);
        var dist = vec3.length(dv);

        scene.camera.position = vec3.moveViewRelative(scene.camera.position, scene.camera.target, -dist * mdelta[0] / 300.0, 0);
        scene.camera.position[1] += dist * mdelta[1] / 300.0;

        scene.camera.position = vec3.add(scene.camera.target, vec3.multiply(vec3.normalize(vec3.subtract(scene.camera.position, scene.camera.target)), dist));
			},
			mouseWheel: function (ctx, mpos, wdelta, keyState) {
        zoom -= wdelta / 1000.0;
        zoomCamera();
			},
			mouseDown: function (ctx, mpos, keyState) {
				downPos = mpos;    

			},
//			mouseUp: function(ctx, mpos, keyState) {

//			},
			mouseUp: function (ctx,mpos,keyState) {
				var dx = mpos[0]-downPos[0], dy = mpos[1]-downPos[1];

        var maxPixelsMoved = 20;  // Maximum number of pixels the cursor may move before it's not considered for ray testing.

				if (Math.sqrt(dx*dx+dy*dy)<maxPixelsMoved) {

					var rayTo = scene.camera.unProject(mpos[0],mpos[1]);

					var rayFrom = scene.camera.getParentedPosition();

					rayFrom = CubicVR.vec3.add(rayFrom,CubicVR.vec3.multiply(CubicVR.vec3.normalize(CubicVR.vec3.subtract(rayTo,rayFrom)),1.5));

					var result = physics.getRayHit(rayFrom,rayTo,true);

					lastResult = !!result;

					if (point1) {
						point1 = null;
						point2 = null;
					}                      

					if (result && !point1) {
						point1 = result;
					}
				} 
			},
			keyDown: function(ctx,mpos,keyCode,keyState) {
				if (keyCode == kbd.KEY_R) {
					if (point1) {
//						physics.removeConstraint(pickConstraint);
						//                              pickConstraint = null;
						point1 = null;
						point2 = null;
					}
					physics.reset(); 
					return false;
				}
			},
			keyPress: function(ctx,mpos,keyCode,keyState) {

			},
			keyUp: null
		});

		//----------- MOUSE EVENTS:END -------------

		CubicVR.addResizeable(layout);

		function acquireTarget(point,target) {
			var sceneObj = point.rigidBody.getSceneObject();
			var proj = point.localPosition;
			var projT = CubicVR.mat4.vec3_multiply(proj,sceneObj.tMatrix);
			var targetLoc = scene.camera.project(projT[0],projT[1],projT[2]);
			target.x = targetLoc[0]-target.width/2;
			target.y = targetLoc[1]-target.height/2;                                              
		}


		var kbd = CubicVR.enums.keyboard;
		
    scene.camera.position = [ 0, 1000, 1000 ];
    var mainLoop = new CubicVR.MainLoop(function(timer, gl) {
        var seconds = timer.getSeconds();

        if (!player.isActive()) { 
            player.activate(); 
        }

        var angV = player.getAngularVelocity();
        angV = CubicVR.vec3.subtract(angV,CubicVR.vec3.multiply(angV,timer.getLastUpdateSeconds()*5));
        player.setAngularVelocity(angV);

        if (mvc.isKeyPressed(kbd.KEY_W)) {
            player.applyImpulse(CubicVR.vec3.multiply(CubicVR.vec3.normalize(scene.camera.unProject(scene.camera.width/2,scene.camera.height/2)),0.001));
        }
        if (mvc.isKeyPressed(kbd.KEY_S)) {
            player.applyImpulse(CubicVR.vec3.multiply(CubicVR.vec3.normalize(scene.camera.unProject(scene.camera.width/2,scene.camera.height/2)),-0.001));
        }

        if (point1) {
            var tetherVec = CubicVR.vec3.subtract(CubicVR.mat4.vec3_multiply(point1.localPosition,point1.rigidBody.getSceneObject().tMatrix),player.getSceneObject().position);
            var tetherDist = CubicVR.vec3.length(tetherVec);
            var tetherDir = CubicVR.vec3.normalize(tetherVec);
            
            
            var tetherImpulse = CubicVR.vec3.multiply(tetherDir,0.03);
            player.applyImpulse(tetherImpulse);

            var linV = player.getLinearVelocity();

            if (tetherDist < 6) {
                linV = CubicVR.vec3.subtract(linV,CubicVR.vec3.multiply(linV,timer.getLastUpdateSeconds()*10.0));
                player.setLinearVelocity(linV);                                            
            } else {
                // nudge the current linear velocity towards the target to prevent orbital swing
                linV = CubicVR.vec3.add(linV,CubicVR.vec3.multiply(linV,timer.getLastUpdateSeconds()*-0.4));  
                
                player.setLinearVelocity(linV);                                                          
            }
        }

        physics.stepSimulation(timer.getLastUpdateSeconds());

        var playerPosition = player.getSceneObject().position,
            camPos = scene.camera.position,
            dt = timer.getLastUpdateSeconds();
        scene.camera.target = playerPosition;
        zoomCamera();
        
        scene.updateShadows();
        scene.render();
        

         if (point1) {
            acquireTarget(point1,target1);
         } else {
            target1.x = -target1.width;
            target1.y = -target1.height;
         }
         
         if (point2) {
            acquireTarget(point2,target2);
         } else {
            target2.x = -target2.width;
            target2.y = -target2.height;
         }

        layout.render();
    });
        
		engine.sound.Track.load({
			url: "../assets/music/perfect-blind-ethernion-ii.ogg",
			callback: function( track ) {
				engine.sound.music.add( 'bg-music', track );
				engine.sound.music.play( 'bg-music' );
			}
		});

    function GameTimer () {
    }
    GameTimer.prototype = {
      intervalId: null,
      secondsLeft: 90,
      start: function gameTimerStart() {
        this.intervalId = setInterval(this.update.bind(this), 1000);
      },      
      stop: function gameTimerStop() {
        clearInterval(this.intervalId);
      },
      update: function gameTimerUpdate() {
        this.secondsLeft -= 1;
        document.getElementById("secondsLeft").textContent = this.secondsLeft;

        if (!this.secondsLeft) {
          this.stop();
          engine.tasker.terminate();
          mainLoop.setPaused(true);
          CubicVR.setMainLoop(null);
        }
      }
    };
    
    var gameTimer = new GameTimer();

		// Run the game.
		this.run = function() {
      gameTimer.start();
      engine.run();
		};
		
	};

	document.addEventListener( 'DOMContentLoaded', function( event ) {
		paladin.create( { debug: true },
				function( engineInstance ) {
			var game = new Game( { engine: engineInstance } );
			console.log( "Starting game" );
			game.run();
		}
		);
		/*
		paladin.create( {debug: true },
				function( engineInstance ) {
			var engine = engineInstance;
			var CubicVR = engine.graphics.CubicVR;
			var physics = new CubicVR.ScenePhysics();
			console.log( CubicVR.CollisionMap );
		}		
		);
		*/
	}, false );

})();
