/*global console,paladin,window,rome_fox_model */
(function() {

	var Game = function( options ) {

		var engine = options.engine,
		    CubicVR = engine.graphics.CubicVR,
        cameraDistance = 2;

    // Specify a different number of asteroids via index.html?# on the url, or use default
		var spawnObjs = (window.location.search.substr(1) | 0) || 100;

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


    /**
     * Spawn asteroid abjects.
     *
     * @return random asteroid object to parent the fox
     */
		var spawnObjects = function (scene,physics,objlist) {

			var nobjs = objlist.length-1;

      var foxAsteroidIndex = Math.floor(Math.random() * spawnObjs);
      var foxAsteroidObj;
      
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
				
				if ( i == foxAsteroidIndex ) {
				  foxAsteroidObj = sceneObj;
				}
			}
			
			return sceneObj;
		};

    function loadThreeMesh(model) {
      var mesh = new CubicVR.Mesh();
      var mat = new CubicVR.Material({
        morph : true,
        colorMap : true,
        specular : [0.1, 0.1, 0.1]
      });
      mat.max_smooth = 80;
      mesh.setFaceMaterial(mat);

      mesh.addPoint(CubicVR.util.repackArray(model.vertices, 3, model.vertices.length / 3));

      for(var i = 0, iMax = mesh.points.length; i < iMax; i++) {
        mesh.points[i] = CubicVR.vec3.multiply(mesh.points[i], 1.0 / 100.0);
      }
      var faces = CubicVR.util.repackArray(model.faces, 8, model.faces.length / 8);
      for( i = 0, iMax = faces.length; i < iMax; i++) {
        var face = faces[i];
        mesh.addFace([face[1], face[2], face[3]]);
      }

      if(model.morphColors) {
        if(model.morphColors[0]) {
          var colors = CubicVR.util.repackArray(model.morphColors[0].colors, 3,
                                       model.morphColors[0].colors.length / 3);
          for( i = 0, iMax = colors.length; i < iMax; i++) {
            mesh.faces[i].setColor(colors[i], 0);
            mesh.faces[i].setColor(colors[i], 1);
            mesh.faces[i].setColor(colors[i], 2);
          }
        }
      }

      mesh.calcNormals();

      // tolerance param allows the compiler to blend colors/verticies
      // via proximity that might otherwise be split
      var cmap = mesh.compileMap(0.2);

      mesh.bindBuffer(mesh.bufferVBO(mesh.compileVBO(cmap)));

      if(model.morphTargets) {
        for( i = 0, iMax = model.morphTargets.length; i < iMax; i++) {
          mesh.points = [];
          mesh.addPoint(CubicVR.util.repackArray(model.morphTargets[i].vertices, 3, model.morphTargets[i].vertices.length / 3));
          for(var j = 0, jMax = mesh.points.length; j < jMax; j++) {
            mesh.points[j] = CubicVR.vec3.multiply(mesh.points[j], 1.0 / 100.0);
          }
          mesh.calcNormals();
          mesh.addMorphTarget(mesh.bufferVBO(mesh.compileVBO(cmap)));
        }
      }

      return mesh;
    }
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
		
    function setupFox(scene, physics, foxObject, parentAsteroid) {
      
      var foxMesh = loadThreeMesh(rome_fox_model);


      var sceneObj = new CubicVR.SceneObject({
        mesh: foxMesh,
        position: CubicVR.vec3.subtract( parentAsteroid.position, [20.0, 20.0, 20.0] ),
        rotation: [0,0,0],
        scale: [0.1,0.1,0.1]
      });

      var rigidObj = new CubicVR.RigidBody(sceneObj, {
        type: CubicVR.enums.physics.body.DYNAMIC,
        mass: 10,
        collision: foxObject.collision
      });
      
      sceneObj.getInstanceMaterials()[0].color =[1,0,1];

      // parentAsteroid.bindChild(sceneObj);
      scene.bindSceneObject( sceneObj );
      physics.bindRigidBody(rigidObj);

      return rigidObj;

      // XXX credit CubicVR/ROME somewhere   
    }

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


		//----------- PARTICLES:START -------------
    var ps = null;
    var maxParticles = 8000;
    ps = new CubicVR.ParticleSystem(maxParticles,false,new CubicVR.Texture("../assets/beam.png"),canvas.width,canvas.height,true);

		//----------- PARTICLES:END -------------

		var objlist = generateObjects();		
		var foxAsteroid = spawnObjects(scene,physics,objlist);
		
		var player = setupPlayer(scene,physics,objlist[0]);

//    uncomment to force player to stay upright.
//		player.setAngularFactor(0);
		player.activate(true);
		player.getSceneObject().visible = true;

    // XXX re-using the capsule obj from the player; good idea or not?
    var fox = setupFox(scene, physics, objlist[0], foxAsteroid);
    fox.activate(true);
    fox.getSceneObject().visible = true;
    
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

        var foxTarget = new CubicVR.View({
            width:50,
            height:50,
            blend:true,
            tint:[1.0,0.4,0.0],
            texture:new CubicVR.Texture('../assets/fox.png')
        });

		layout.addSubview(target1);
		layout.addSubview(target2);
        layout.addSubview(foxTarget);

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
        mvc.orbitView( mdelta );

			},
			mouseWheel: function (ctx, mpos, wdelta, keyState) {
        cameraDistance -= wdelta/1000;
        cameraDistance = Math.min(10, Math.max(1, cameraDistance ));    //shorthand to ensure that 1 < cameraDistance < 10
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
		
    scene.camera.position = [ 0, 1000, 2000 ];
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

        var projT = CubicVR.mat4.vec3_multiply( [0, 0, 0], fox.getSceneObject().tMatrix );
        var foxLoc = scene.camera.project( projT[0], projT[1], projT[2] );        
        var targetDir = CubicVR.vec3.normalize( CubicVR.vec3.subtract( scene.camera.position, scene.camera.target ) );
        var foxDir = CubicVR.vec3.normalize( CubicVR.vec3.subtract( scene.camera.position, projT ) );
        var angle = CubicVR.vec3.angle( targetDir, foxDir );
        if( angle > Math.PI / 2.0 ) {            
            foxTarget.x = -foxTarget.width;
            foxTarget.y = -foxTarget.height;
        }
        else {
            foxTarget.x = foxLoc[0]-foxTarget.width/2;
            foxTarget.y = foxLoc[1]-foxTarget.height/2;
        }

        if (point1) {
            var tetherVec = CubicVR.vec3.subtract(CubicVR.mat4.vec3_multiply(point1.localPosition,point1.rigidBody.getSceneObject().tMatrix),player.getSceneObject().position);
            var tetherDist = CubicVR.vec3.length(tetherVec);
            var tetherDir = CubicVR.vec3.normalize(tetherVec);
            
            
            var tetherImpulse = CubicVR.vec3.multiply(tetherDir,0.3);
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
            playerLastPosition = player.getSceneObject().lposition,
            playerSceneObj = player.getSceneObject(),
            camPos = scene.camera.position,
            dt = timer.getLastUpdateSeconds();
        scene.camera.target = playerPosition;

        // use trackTarget to pull the camera upto cameraDistance from the target, 
        // but offset camera by playerPosition-playerLastPosition to avoid fishtailing
        scene.camera.trackTarget(scene.camera.target, 0.1, cameraDistance);
        scene.camera.position = CubicVR.vec3.add(scene.camera.position,CubicVR.vec3.subtract(playerPosition,playerLastPosition));
        
        scene.updateShadows();
        scene.render();
        
        // Draw grappling beam
        if (point1) {
          var nominalBeamStep = 0.2;

          var beamVector = CubicVR.vec3.subtract(CubicVR.mat4.vec3_multiply(point1.localPosition,point1.rigidBody.getSceneObject().tMatrix),playerPosition);
          var beamLength = CubicVR.vec3.length(beamVector);
          var numPoints = Math.floor(beamLength/nominalBeamStep);
          if (numPoints > maxParticles) numPoints = maxParticles;

          ps.numParticles = numPoints;          

          if (numPoints != 0) {
            var linStep = CubicVR.vec3.multiply(beamVector,1.0/numPoints);
            var pos = playerPosition.slice(0);  
            for (var i = 0, iMax = numPoints*3; i < iMax; i+=3) {
              ps.arPoints[i] = pos[0];
              ps.arPoints[i+1] = pos[1];
              ps.arPoints[i+2] = pos[2];
              pos[0]+=linStep[0];
              pos[1]+=linStep[1];
              pos[2]+=linStep[2];
            }
            ps.updatePoints();
            ps.draw(scene.camera.mvMatrix, scene.camera.pMatrix);
          }
         }
         // end grappling line

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
          
          // push the canvas behind the "game over" banner
          CubicVR.getCanvas().style.zIndex = -1;
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
			  game.run();
		  }
		);

    // Thanks Paul Irish (and Google)
    var requestAnimFrame = (function() {
      return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
    })();

    var creditsBtn = document.getElementById( 'credits-btn' ),
        creditsContainer = document.getElementById( 'credits-container' );
        creditsDiv = document.getElementById( 'credits' ),
        creditsVisible = false
        creditsTop = 0,
        creditsStop = false;
    
    function keyDown( e ) {
      if ( creditsVisible && e.which === 27 ) {
        toggleCredits( false );
      } //if
    } //keyDown

    var lastTime = Date.now();
    function rollCredits() {
      var now = Date.now();
      creditsDiv.scrollTop = creditsTop;
      if( creditsVisible &&
          !creditsStop &&
          creditsDiv.offsetHeight > creditsDiv.scrollTop ) {
        if ( now - lastTime > 60 ) {
          creditsTop += 1;
          lastTime = now;
        } //if
        requestAnimFrame( rollCredits );
      } //if
    } //rollCredits
    requestAnimFrame( rollCredits );

    function stopCredits ( e ) {
      creditsStop = true;
    } //stopCredits

    function toggleCredits( state ) {
      if( state ) {
        creditsContainer.style.display = "block";
        creditsTop = 0;
        creditsStop = false;
        requestAnimFrame( rollCredits );
      }
      else {
        creditsContainer.style.display = "none";
      } //if
      creditsVisible = state;
    } //closeCredits

    creditsBtn.addEventListener( 'click', function( e ) {
      if( creditsVisible ) {
        toggleCredits( false );
      }
      else {
        toggleCredits( true );
      } //if
    }, false );

    window.addEventListener( 'keydown', keyDown, false );

    creditsDiv.addEventListener( 'mousedown', stopCredits, false );
    creditsDiv.addEventListener( 'DOMMouseScroll', stopCredits, false );
    creditsDiv.addEventListener( 'mousewheel', stopCredits, false );

	}, false );

})();
