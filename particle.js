//var Mplus=1, qplus=1;

class Plusparticle
{
	constructor(x,y,z,vx,vy,vz)
	{
		this.x = x;
		this.y = y;
		this.z = 0;
		this.vx = vx;
		this.vy = vy;
		this.vz = 0;
		
		this.physics = {mass:1.673e-27, charge:1.602e-18}
		
		this.breadcrums = [[this.x,this.y,this.z]];
		this.escaped = false;
	}
	
	crumbread(L = 5)
	{
		this.breadcrums.push([this.x,this.y,this.z]);
		if(this.breadcrums.length>L){ this.breadcrums.shift();}
	}
	
	accelerate = function(E, t) // unit E: N/C, t: s
	{
		this.vx = this.vx + E[0] * t * this.physics.charge / this.physics.mass;
		this.vy = this.vy + E[1] * t * this.physics.charge / this.physics.mass;
		this.vz = 0;
		this.x = this.x + this.vx * t;
		this.y = this.y + this.vy * t;
		this.z = 0;
	}
	
	bouncey = function( border, origin = 0 )
	{
		if( this.y < origin )
		{
			this.y  = 2* origin - this.y;
			this.vy = - this.vy;
		}
		if( (Math.abs(this.y) > border) && !this.escaped ){ this.escaped = true; console.log("escaped"); }
	}
	
	bouncex = function( border, origin = 0 )
	{
		while(this.x > border){ this.x = origin + (this.x - border); }
		while(this.x < origin){ this.x = border - (origin - this.x); }
	//this.vx =  this.vx;
	}
	
	nomove()
	{
		this.vx = 0;
		this.vy = 0;
		this.vz = 0;
	}
	
	
}