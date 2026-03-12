class Gridpoint
{
	constructor(x,y,symbol)
	{
		this.x = x; // unit: ISO m
		this.y = y; // unit: ISO m
		this.symbol = symbol;
	}
}

class Grid
{
	// set of Gridpoints and objects in preparation to be pictured
	// units in ISO: m,kg,s,A
	
	constructor( Extremex=1, Extremey=1 ) // unit Extremex, Extremey: ISO m
	{
		// grid origin
		this.Originx = 0;
		this.Originy = 0;
		// grid extreme gUx,gUy
		this.Extremex = Extremex; // unit: ISO m
		this.Extremey = Extremey; // unit: ISO m
		
		// horizontal and vertical grid points
		this.pointsx = 16;
  	this.pointsy = 6;
		// horizontal and vertical grid spaces
		this.xstep = ( this.Extremex - this.Originx ) / ( this.pointsx - 1 ); // unit: ISO m
		this.ystep = ( this.Extremey - this.Originy ) / ( this.pointsy - 1 ); // unit: ISO m
		// gridpoints to attach values to
		this.gridpoints = [];		
	}
	
	eVectors( ringtrain )
	{
		let xsteps = 0, ysteps=0;
		for( let x=0; x<=this.pointsx; x++ )
		{
			xsteps = x * this.xstep;
			this.gridpoints.push([]);
			for( let y=0; y<=this.pointsy; y++)
			{
				ysteps = y * this.ystep;
				this.gridpoints[x].push(new Gridpoint(xsteps, ysteps, ringtrain.pointField(xsteps, ysteps)));
			}			
		}
	}
}

class Canvas
{	
	constructor( canvasId, grid )
	{
		// @param HTMLcanvas: Canvas object in HTML document
		this.HTMLcanvas = document.getElementById(canvasId);
		this.ctx = this.HTMLcanvas.getContext("2d");
		
		this.grid = grid; // Instance of Grid;
		
		// set scales
		this.scalex = this.HTMLcanvas.width  / (this.grid.Extremex - this.grid.Originx);
		this.scaley = this.HTMLcanvas.height / (this.grid.Extremey - this.grid.Originy);
	}
	// class const for electric scale
	// call as Canvas.scelectr
	static get scelectr(){ return Ring.TOPPOTENTIAL*1e4; }
	
	resize()
	{
		let vhratio = this.HTMLcanvas.height / this.HTMLcanvas.width;
		this.HTMLcanvas.width = window.innerWidth*.95;
		
		this.HTMLcanvas.height = vhratio * this.HTMLcanvas.width;
		
		this.scalex = this.HTMLcanvas.width  / (this.grid.Extremex - this.grid.Originx);
		this.scaley = this.HTMLcanvas.height / (this.grid.Extremey - this.grid.Originy);
	}
		
	rectangle( rgb )
	{
		let originalfillstyle = this.ctx.fillStyle;
		this.ctx.fillStyle = rgb;
		this.ctx.fillRect(0, 0, this.scalex * this.grid.Extremex, this.scaley * this.grid.Extremey);
		this.ctx.fillStyle = originalfillstyle;
	}
	
	diagonal()
	{
//	let ctx = this.toCanvas();
//	var c = document.getElementById("myCanvas");
//	var ctx = c.getContext("2d");
		this.ctx.moveTo(0,0);
		this.ctx.lineTo(this.scalex * this.grid.Extremex, this.scaley* this.grid.Extremey);
		this.ctx.stroke();
	}
	// 
	vector( X, Y, LX, LY )
	{
		let distortion = this.scalex / this.scaley; // console.log("x/y distortion "+distortion);
		const hvs = Canvas.scelectr; //4e8;
		const vvs = hvs / distortion; // console.log("vertical vector scaling "+vvs);
		// console.log("y/x correction "+vvs/hvs);
		
		X = this.scalex * X;
		Y = this.scaley * Y;
		let toX = X + this.scalex * LX / hvs;
		let toY = Y + this.scaley * LY / vvs;
		
		this.ctx.beginPath();
		this.ctx.moveTo(X, Y);
		this.ctx.lineTo(toX, toY);
		this.ctx.stroke();
		// encircle vector origin
		this.ctx.beginPath();
//	this.ctx.moveTo(X+.5, Y);
		this.ctx.arc(X, Y, 2, 0, 2 * Math.PI);
		this.ctx.fillStyle = "white"; 
		this.ctx.fill()
		this.ctx.stroke();
	}
	
	eVectors( ringtrain )
	{
		let xsteps = 0, ysteps=0, eVector=[];
		for( let x=0; x<=this.grid.pointsx; x++ )
		{
			xsteps = x * this.grid.xstep;
			for( let y=0; y< this.grid.pointsy; y++)
			{
				ysteps = y * this.grid.ystep;
				eVector = ringtrain.pointField(xsteps, ysteps);
  			// console.log(eVector);
				this.vector( xsteps, ysteps, eVector[0], eVector[1] );
			}			
		}
	}
	
	balloon( ring )
	{
		this.ctx.beginPath();
		// console.log("el.ch."+ ring.electrics.charge);
		let RQradius = Math.abs( ring.electrics.charge ) * Canvas.scelectr; // * 4e8
//	console.log([ring.cx * this.scalex, ring.metrics.ringRadius * this.scaley, RQradius, 0, 2 * Math.PI]);
		this.ctx.arc(ring.cx * this.scalex, ring.metrics.ringRadius * this.scaley, RQradius, 0, 2 * Math.PI);
		this.ctx.fillStyle = ring.electrics.charge>0 ? "red" : "blue"; this.ctx.fill();
		// somehow red and blue have become - +
		this.ctx.stroke();
	}
	
	ion( pp ) // plusparticle
	{
		if(pp.escaped){ return; }
		this.ctx.beginPath();
		// console.log("el.ch."+ ring.electrics.charge);
		let RQradius = 15;
		
//	console.log([pp.x * this.scalex, pp.y * this.scaley, RQradius, 0, 2 * Math.PI]);
  	
		this.ctx.arc(pp.x * this.scalex, pp.y * this.scaley, RQradius, 0, 2 * Math.PI);
		this.ctx.fillStyle = "yellow"; this.ctx.fill();
		this.ctx.stroke();
	}
}

class Handling
{
	constructor(grains = 1000)
	{
		this.grains = grains;
	}
	
	vacuum()
	{
		window.cyclephase += 1/document.getElementById('tcs').value; 
//	console.log(window.ringtrain.rings[0].electrics.potential);
		window.ringtrain.rollPotentials(window.cyclephase);
//	console.log(window.ringtrain.rings[0].electrics.potential);
  	
  	window.cnv.rectangle('#ABCDEF');
		
		for( let rinx = 0; rinx < window.ringtrain.rings.length; rinx++ )
		{ window.cnv.balloon( window.ringtrain.rings[rinx] ); }
		
		window.cnv.eVectors( window.ringtrain );
	}
	
	start( plusparticle = window.plusparticle )
	{
		plusparticle.nomove(); 
		plusparticle.escaped = false;
		window.timecycles = 0;
		
		let reachx = (window.cnv.grid.Extremex - window.cnv.grid.Originx); // console.log('reachx '+reachx);
		plusparticle.x = document.getElementById('ppx').value / this.grains * reachx;
		while(plusparticle.x < 0){ plusparticle.x += reachx; }
		while(plusparticle.x > reachx){ plusparticle.x -= reachx; }
		window.startx = plusparticle.x;
			
		let reachy = (window.cnv.grid.Extremey - window.cnv.grid.Originy); // console.log('reachy '+reachy);
		plusparticle.y = document.getElementById('ppy').value / this.grains * reachy;
		while(plusparticle.y < 0){ plusparticle.y += reachy; }
		while(plusparticle.y > reachy){ plusparticle.y -= reachy; }
		window.starty = plusparticle.y;
			
		window.cnv.ion(plusparticle);
		
		window.plusparticle = plusparticle;
	}
	
	next( plusparticle = window.plusparticle )
	{
		this.vacuum();
		
		let E = window.ringtrain.pointField(plusparticle.x, plusparticle.y);
		let ct = fullcycletime/document.getElementById('tcs').value;
		window.timecycles ++;
		plusparticle.accelerate(E, ct);
		plusparticle.bouncex( cnv.grid.Extremex, cnv.grid.Originx );
		plusparticle.bouncey( cnv.grid.Extremey, cnv.grid.Originy );
		let stat = "";
		if(!plusparticle.escaped)
		{
			stat = JSON.stringify({
				startx:window.startx.toPrecision(4),
				starty:window.starty.toPrecision(4),
				timecycles: (window.timecycles * ct/fullcycletime).toPrecision(4)
			}).replaceAll(',',', ');
			console.log("speed "+(((plusparticle.vx**2 + plusparticle.vy**2)**.5)/3e8).toPrecision(4) + " c");
		}
		window.cnv.ion(plusparticle);
		
		window.plusparticle = plusparticle;
//	console.log(stat);
		return stat;
	}
	
	repeat( loops=10 )
	{
		let stats = "[ ", statuit="", stat="";
		for( let L=0; L<loops; L++)
		{
			document.getElementById('ppx').value = Math.random() * this.grains;
			document.getElementById('ppy').value = Math.random() * this.grains;
			
			this.start();
			while(!plusparticle.escaped)
			{
				statuit = stat;
				stat = this.next();
				document.getElementById('stat').value = statuit;
			}
			plusparticle.escaped = false;
			stats += statuit + ", ";
		}
		return stats.substring(0,stats.length-2); + " ]";
	}
}
