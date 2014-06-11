var app = function() {
	'use strict';

	var controller 		= new Leap.Controller({enableGestures: true})
	  , debug 			= true // toggle console logging
	  , xoffset 		= window.innerWidth / 4
	  , crosshair 		= {}
	  , thumb 			= { x: 0 }
	  , shootSettings 	= {
	  		distance: 70, 	// distance required for thumb to travel
	  		velocity: 300	// velocity thumb must have during travel
	  }
	  , latestFrame;

	function moveCrosshair(x,y) {
		crosshair.el.style.left 	= x + 'px';
		crosshair.el.style.bottom   = y + 'px';
		crosshair.x = crosshair.el.offsetLeft;
		crosshair.y = crosshair.el.offsetTop;
	}

	function shoot() {
		_flashScreen();
		var potentialEnemy = document.elementFromPoint(crosshair.x, crosshair.y);

		if (potentialEnemy && potentialEnemy.classList.contains('enemy'))
			potentialEnemy.click();
	}

	function _flashScreen() {
		document.body.style.backgroundColor = 'white';

		_.delay(function() {
			document.body.style.backgroundColor = '#ddd';
		}, 20);
	}

	function accountForScreenXOffset(x) { return Math.floor( (x * 5) + xoffset ); }
	function accountForScreenYOffset(y) { return Math.floor( y * 2 ); }

	function watchThumbMotion(pointer) {
		var distance = Math.floor( Math.abs(thumb.x - Math.abs(pointer.tipPosition[0])) )
		  , velocity = Math.abs(pointer.tipVelocity[0]);
		
		if (distance > shootSettings.distance && velocity > shootSettings.velocity) {
			app.shoot();

			console.info('BANG! distance: ' + distance + ', velocity: ' + velocity);
		} else {
			console.log('distance: ' + distance + ', velocity: ' + velocity);
		}

		// stash new x
		thumb.x = pointer.tipPosition[0];
	}
	

	////////////////  GESTURE EVENTS
	controller.gesture('keyTap', function(data) {
		debug && console.log('tappy');
	});

	controller.gesture('screenTap', function(data) {
		app.moveCrosshair(
			app.accountForScreenXOffset(data.gestures[0].position[0]),
			app.accountForScreenYOffset(data.gestures[0].position[1])
		);

		debug && console.log('poke');
	});


	////////////////  PRIMARY LOOP - ALREADY RAF
	controller.loop(function(frame) {
		var fingers 	= frame.pointables,
			latestFrame = frame;

		if (_.isEmpty(fingers)) return;

		app.moveCrosshair(
			app.accountForScreenXOffset(fingers[0].tipPosition[0]),
			app.accountForScreenYOffset(fingers[0].tipPosition[1])
		);

		if (fingers[1] && fingers[1].tipPosition) {
			app.watchThumbMotion(fingers[1]);
		}
	});


	//////////////// DEVICE EVENTS
	controller.on('ready', function() {
		crosshair.el = document.getElementById('crosshair');

		debug && console.log("ready");
	});


	//////////////// EXPOSED METHODS
	return {
		moveCrosshair: 				moveCrosshair,
		shoot: 						_.throttle(shoot, 500),
		watchThumbMotion: 			watchThumbMotion,
		accountForScreenXOffset: 	accountForScreenXOffset,
		accountForScreenYOffset: 	accountForScreenYOffset
	};

}();