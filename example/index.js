
var THREE = require( 'three.js' );

var ArcSprites = require( '../ArcSprites' );

window.onload = function(){

	document.body.style.backgroundColor = '#eeeeee';

	var arcSprites = new ArcSprites({
		radius: 200,
		thickness: 30
	});

	var textures = [];

	arcSprites.generate( function( canvas ){

		// debug
		canvas.style.backgroundColor = '#fff';
		canvas.style.margin = '4px';
		document.body.appendChild( canvas );

		// usage
		var texture = new THREE.Texture( canvas );
		textures.push( texture );

	});

	var renderer = new THREE.WebGLRenderer();



	console.log( 'OKOK' );

};