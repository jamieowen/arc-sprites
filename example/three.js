
var THREE = require( 'three.js' );

var ArcSprites = require( '../ArcSprites' );

window.onload = function(){

	document.body.style.backgroundColor = '#eeeeee';

	var radius = 200;

	var arcSprites = new ArcSprites({
		radius: radius,
		thickness: 8,
		resolution: 2,
		color: '#000'
	});

	var canvases  = [];
	var materials = [];

	arcSprites.generate( function( canvas ){

		// debug
		//canvas.style.backgroundColor = '#fff';
		//canvas.style.margin = '4px';
		//document.body.appendChild( canvas );

		canvases.push( canvas );

		var texture = new THREE.Texture( canvas );
		var material = new THREE.MeshBasicMaterial( {
			map: texture,
			transparent: true,
			color: 0xffff00,
			//opacity: 0.3,
			side: THREE.DoubleSide } );

		texture.needsUpdate = true;

		materials.push( material );
		return material;

	});

	var scene = new THREE.Scene();

	var size = 600;
	var camera = new THREE.PerspectiveCamera( 75, 600/600, 1, 10000 );

	//var geometry = new THREE.BoxGeometry( 200, 200, 200 );
	//var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

	//var mesh = new THREE.Mesh( geometry, material );
	//scene.add( mesh );

	var renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setSize( size,size );

	var scale = 2;

	var geometry = new THREE.PlaneGeometry( scale,scale,1,1 );

	var wireframe = new THREE.MeshBasicMaterial({
		wireframe: true,
		color: 0xff0000
	});
	var test = new THREE.Mesh( geometry, wireframe );
	scene.add( test );

	var time = 0;
	var camDistance = 200;

	var pool = [];
	var getPooled = function( idx, material ){
		var mesh;
		material = wireframe;
		if( idx >= pool.length ){
			mesh = new THREE.Mesh( geometry, material );
		}else{
			mesh = pool[ idx ];
			mesh.material = material;
		}

		return mesh;
	};

	arcSprites.drawRadians( Math.PI * 0.4, function( idx, radians, material ){

		console.log( 'DRAW RADIANNS : ', idx, radians );

		var mesh = getPooled( idx, material );
		scene.add( mesh );

		//mesh.position.x = Math.cos( radians ) *
		mesh.rotation.z = radians;
		mesh.position.z = idx * 0.01;
		mesh.position.x = Math.cos( radians ) * ( radius * scale );
		mesh.position.y = Math.sin( radians ) * ( radius * scale );

	});

	var center = new THREE.Vector3();
	function render() {

		requestAnimationFrame( render );

		time++;
		camera.position.x = Math.cos( time * 0.01 ) * camDistance;
		camera.position.z = Math.sin( time * 0.01 ) * camDistance;
		camera.lookAt(center);

		//arcSprites.drawRadians( Math.PI * 0.25, function( idx, radians, texture ){

		//});

		renderer.render( scene, camera );

	}

	render();

	document.body.appendChild( renderer.domElement );


};