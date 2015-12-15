
var defaultOpts = {
	radius: 200,
	thickness: 10,
	color: '#fff',
	stepMin: 0.5,
	stepMax: 45
};

var ArcSprites = function( opts ){

	this._opts = opts || defaultOpts;

	if( this._opts !== defaultOpts ){
		for( var key in defaultOpts ){
			if( !this._opts[key] ){
				this._opts[key] = defaultOpts[key];
			}
		}
	}

	this._steps = [];

	var min = this._opts.stepMin;
	var max = this._opts.stepMax;

	while( min < max ){
		this._steps.push( {
			value: min,
			texture: null, // user generated when calling generate()
			canvas: null
		} );

		min *= 2;
	}
	if( min !== max ){
		this._steps.push( max );
	}

};


module.exports = ArcSprites;


ArcSprites.prototype = {

	generate: function( map ){

		// for now keep dimensions of canvases the same.
		var w = ( this._opts.radius/2 ) + ( this._opts.thickness / 2 ) + 2;
		var h = this._opts.radius/2;

		var radians,deg,context;
		var canvas;
		var texture;

		var toRad = ( Math.PI / 180 );

		for( var i = 0; i<this._steps.length; i++ ){
			canvas = document.createElement( 'canvas' );

			canvas.width = w;
			canvas.height = h;

			deg = this._steps[ i ];
			radians = toRad * deg;

			//arc(x, y, radius, startAngle, endAngle, anticlockwise)
			context = canvas.getContext('2d');
			context.beginPath();

			context.lineWidth = this._opts.thickness;
			context.strokeStyle = 'black';
			context.arc( 0,0, this._opts.radius / 2, 0, radians, false );

			context.stroke();

			if( map ) {
				texture = map(canvas, radians);
			}


		}
	},

	forRadians: function( radians, apply ){


	}

};
