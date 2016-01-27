
var toRadians = Math.PI / 180;

var defaultOpts = {

	radius: 200,
	thickness: 10,
	resolution: 1,
	trim: false,
	trimPadding: 2,

	arcOverdraw: 0.4 * toRadians, // play with this value if gaps appear
	color: '#ffffff',
	segmentMin: 1 * toRadians, // the minimum arc texture size in radians
	segmentMax: 45 * toRadians, // // the maximum arc texture size in radians

	debug: false,
	debugColor: '#0000ff',
	debugAlpha: 0.1

};

var ArcTextures = function( opts ){

	this._opts = opts || defaultOpts;

	if( this._opts !== defaultOpts ){
		for( var key in defaultOpts ){
			if( !this._opts[key] ){
				this._opts[key] = defaultOpts[key];
			}
		}
	}

	this._segments = [];

	var pushSegment = function( radians ){
		this._segments.push( {
			radians: radians,
			texture: null,
			canvas: null
		})
	}.bind(this);

	var min = this._opts.segmentMin;
	var max = this._opts.segmentMax;

	while( min < max ){
		pushSegment( min );
		min *= 3;
	}
	if( min !== max ){
		pushSegment( max );
	}

};


module.exports = ArcTextures;


ArcTextures.prototype = {

	generate: function( map ){

		var resolution 	= this._opts.resolution;
		var trim 		= this._opts.trim;
		var trimPadding = this._opts.trimPadding;
		var thickness 	= this._opts.thickness * resolution;
		var arcOverdraw = this._opts.arcOverdraw;

		// subtract half thickness to output at exact specified radius
		var radiusOuter = this._opts.radius * resolution;
		var radius 		= radiusOuter - ( thickness * 0.5 );
		var radiusInner = radius - ( thickness * 0.5 );
		var radiusMask	= radiusOuter + ( thickness * 2.0 ) + 10.0; // add extra constant for smaller line thicknesses

		var maxRadians  = this._segments[ this._segments.length-1 ].radians;
		var width = Math.ceil( radius + ( thickness * 0.5 ) ); // TODO : correct this.. ( or limit > 90 )
		var height = width;

		var radians,context;
		var drawCanvas,outputCanvas;
		var texture;
		var entry;
		var trimX,trimY;

		var createCanvas = function( w,h ){
			var canvas = document.createElement( 'canvas' );
			canvas.width  = w || width;
			canvas.height = h || height;
			return canvas;
		};

		// create one draw canvas that will be drawn to.
		// the trimmed contents will be copied to the output canvas.
		if( trim ){
			drawCanvas = createCanvas();
		}

		for( var i = 0; i<this._segments.length; i++ ){

			entry = this._segments[i];
			radians = entry.radians;

			if( trim ){
				context = drawCanvas.getContext('2d');
				context.clearRect( 0,0,width,height );
			}else{
				drawCanvas = createCanvas();
				context = drawCanvas.getContext('2d');
			}

			// draw arc.
			context.globalAlpha = 1.0;
			context.globalCompositeOperation = 'source-over';

			console.log( 'GENERATE : ', thickness );
			context.lineWidth 	= thickness;
			context.strokeStyle = this._opts.color;
			context.beginPath();
			context.arc( 0,0, radius, 0, maxRadians + arcOverdraw, false );
			context.stroke();
			context.closePath();

			// extract region we want using comp operations -
			// gives a more consistent edge AA using this method
			context.globalCompositeOperation = 'destination-in';
			context.beginPath();
			context.moveTo( 0,0 );
			context.lineTo( Math.cos( 0 ) * radiusMask, Math.sin( 0 ) * radiusMask );
			context.lineTo( Math.cos( radians * 0.5 ) * radiusMask, Math.sin( radians * 0.5 ) * radiusMask );
			context.lineTo( Math.cos( radians + arcOverdraw ) * radiusMask, Math.sin( radians + arcOverdraw ) * radiusMask );
			context.fillStyle = 'blue';
			context.fill();
			context.closePath();

			// draw debug bg
			if( this._opts.debug ){
				context.globalCompositeOperation = 'source-over';
				context.globalAlpha = this._opts.debugAlpha;
				context.fillStyle 	= this._opts.debugColor;
				context.beginPath();
				context.rect(0,0,width,height);
				context.fill();
				context.closePath();

				/**
				context.globalAlpha = 1.0;
				context.fillStyle 	= 'yellow';
				context.beginPath();
				context.rect(trimX,trimY,10,10);
				context.fill();
				context.closePath();
				**/
			}

			if( trim ){

				trimX = Math.floor( Math.cos( radians + arcOverdraw ) * radiusInner ) - trimPadding;
				trimY = Math.ceil( Math.sin( radians + arcOverdraw ) * radiusOuter ) + trimPadding;

				// create a trimmed canvas and output the generated data.
				outputCanvas = createCanvas( width-trimX, trimY );
				outputCanvas.getContext('2d').putImageData(
					context.getImageData( trimX,0,outputCanvas.width,outputCanvas.height ),
					0,0
				);

			}else{
				outputCanvas = drawCanvas;
			}

			entry.canvas = outputCanvas;

			if( map ){
				texture = map(entry.canvas, radians);
				entry.texture = texture;
			}

		}
	},

	drawRadians: function( radians, draw ){

		var count = 0;
		var segStart = this._segments.length-1;
		var entry;
		var div;
		var rad = radians;

		while( segStart >= 0 ){
			entry = this._segments[segStart];
			div = Math.floor( rad / entry.radians );

			for( var i = 0; i<div; i++ ){

				draw( count, radians - rad, entry.texture );
				rad -= entry.radians;
				count++;

			}
			segStart--;
		}

	}

};