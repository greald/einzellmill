// static electric field of N-pointed Rings
// physical parameters in ISO units (m,kg,C)
const epsilon0 = 8.854188e-12; // console.log(epsilon0);// F/m = C/Vm};

// copy from https://ghvernuft.nl/os/tolerance.js
if(typeof ca != "function") // "if ! function_exists(ca)" src 
{
	function ca( a, b, reference=[0,1] )
	{
		// return: true if a is close enough to b
		// @param a, b Number
		// @param reference range for magnitude of order
		
		let refmax = Number.MIN_VALUE;
		let refmin = Number.MAX_VALUE;
		for(let y=0; y<reference.length; y++)
		{
			refmax = Math.max(refmax, reference[y]);
			refmin = Math.min(refmin, reference[y]);
		}
		
		const tolerance = (refmax - refmin) * Number.EPSILON;
		return tolerance > Math.abs( a - b );
	}
}
if(typeof littleEnough != "function")
{
	function littleEnough( a, reference=[0,1] )
	{
		return ca(0, a, reference) ? 
			(reference.sort(function(a, b){return b-a}))[0]  * Number.EPSILON : 
			a ;
	}
}

class Ring // (cx,cy,cz,linephase)
{// static electrical field of one ring
	
	#NOMINALPOTENTIAL;
	
	constructor(cx,cy,cz, linephase)
	{
		this.#NOMINALPOTENTIAL = 30000; // V
		// calculations
		this.ringsegments = window.N >0 ? window.N : 24;
		
		// geometrics
		this.cx = cx;               // x-coordinate of center of Ring
		this.cy = 0; 				        // y-coordinate of center of Ring
		this.cz = 0;                // z-coordinate of center of Ring
		this.linephase = linephase; // Number between 0 and 1, corresponding to 0 to 2π in the electrical linephase
		this.metrics = {ringRadius: 0.015, draadstraal: .001};
		
		// electrics
		this.electrics = {
			toppotential: 30000*Math.sqrt(2),
			potential:0,
			charge: Math.cos(2*Math.PI*this.linephase) * epsilon0 
			}
	}
	static get TOPPOTENTIAL(){ return this.#NOMINALPOTENTIAL * Math.sqrt(2); }
	
	segmentfield(sgm, x,y,z)
	{
		// @param sgm: Integer from [0, this.ringsegments]
		// @param x,y,z: coordinates relative to center of Ring
		// return [ex,ey,ez]: Array of contributed electric field components in point x,y,z
		
		z = 0; // since we only check points in the xy plane
		
		// ignore illegal this.ringsegments values
		if( (0<= sgm) && (sgm < this.ringsegments) ){} else {console.log("illegal sgm "+sgm); return [0,0,0];}
		
		// x distance between checkpoint x,y,0 and ring segment sgm
		let rix = x - this.cx;
		// y distance between checkpoint x,y,0 and ring segment sgm
		let riy = y - (this.cy + this.metrics.ringRadius * Math.cos( 2*Math.PI*sgm / this.ringsegments ));
		// z distance between checkpoint x,y,0 and ring segment sgm
		let riz = z - (this.cz + this.metrics.ringRadius * Math.sin( 2*Math.PI*sgm / this.ringsegments ));
		
		let sqhyp = rix**2 + riy**2 + riz**2;
		// to avoid division by zero; make hyp sure to be away from zero
		let hyp = sqhyp <= Number.EPSILON ? Number.EPSILON : sqhyp**0.5;
		
		// contributed electric field strength
		let Esgm = this.electrics.charge / this.ringsegments / sqhyp / ( 4 * Math.PI * epsilon0 );
		// FINITE variable resgm
		let resgm = Esgm / hyp;
		// components in xyz frame
		let ex = resgm * rix;
		let ey = resgm * riy;
		let ez = resgm * riz;

		return [ex,ey,ez];
	}
	
	ringfield(x,y,z)
	{
		// @param x,y,z coordinates relative to center of Ring
		// return [Ex, Ey, Ez], the superposition of N ring segment fields in x,y,0 
		
		let E=[0,0,0];
		for( let sgm=0; sgm<this.ringsegments; sgm++)
		{
			let e = this.segmentfield(sgm, x,y,z);
			E[0] += e[0];
			E[1] += e[1];
			E[2] += e[2];
		}
		return E;
	}
}

class Ringtrain // (rings)
{
	// static electric field of a set of Ring along x-axis
	constructor(rings)
	{
	// @param rings: Array of Ring; first and last ring's linephases should differ 0%1
		// // check modulo cycle == 0
		let cycle = rings[0].linephase - rings[rings.length-1].linephase;
		// // bron: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
		this.rings = cycle%1 == 0 ? rings : [];
		
		this.mutualCapacities = [];
		this.precision = 1/10000;
	}
	
	// Q2U(): given charges // return: potential difference from one ring to another (V)
	Q2U(rinx1, rinx2)
	{
		// path from rings this.rings[rinx1] and this.rings[rinx2] ...
		// ... along x=dx, y=this.rings[rinx1].metrics.ringRadius, z=0
		let path =
			this.rings[rinx2].cx - this.rings[rinx2].metrics.draadstraal -
			this.rings[rinx1].cx + this.rings[rinx1].metrics.draadstraal;
//	console.log("path "+rinx2+"-"+rinx1+" "+ path);
//	let step = path / steps;
		const step = path * this.precision;
		let Ex = [], potx = 0, pot = [potx];
		
		for(let 
			dx = this.rings[rinx1].cx + this.rings[rinx1].metrics.draadstraal;
			dx < this.rings[rinx2].cx - this.rings[rinx2].metrics.draadstraal;
			dx += step)
		{
			let Ea = this.rings[rinx1].ringfield(dx, this.rings[rinx1].metrics.ringRadius, 0);
			let Eb = this.rings[rinx2].ringfield(dx, this.rings[rinx2].metrics.ringRadius, 0);
			
			Ex = [Ea[0]+Eb[0], Ea[1]+Eb[1], Ea[2]+Eb[2]];
			potx -= Ex[0]*step;
			pot.push(potx);
		}
		
		return potx - pot[0];
	}
	// set the capacity for ring[rinx1] to ring[rinx2]
	capacityOfRings(rinx1, rinx2) // C=Q/V
	{
		// @params rinx1, rinx2: indices of this.rings
//	console.log(JSON.stringify(this.rings));
		const oriloads = [this.rings[rinx1].electrics.charge, this.rings[rinx2].electrics.charge];
		// Load test charges
		this.rings[rinx2].electrics.charge = 1;//epsilon0;
		this.rings[rinx1].electrics.charge = -1;//epsilon0;
//	console.log(JSON.stringify(this.rings));
		
		let potdiff = this.Q2U(rinx1, rinx2);
//	console.log(potdiff);
		let charges = this.rings[rinx2].electrics.charge - this.rings[rinx1].electrics.charge;
		
		// Restore charges
		this.rings[rinx2].electrics.charge = oriloads[1];
		this.rings[rinx1].electrics.charge = oriloads[0];
//	console.log(JSON.stringify(this.rings));
		
		// dont divide by zero
		potdiff = ca(potdiff, 0, [0, charges]) ? charges*Number.EPSILON : potdiff;
		return charges/potdiff;
//	return potdiff !== 0 ? charges/potdiff : undefined;
//	return potdiff**2 / Number.MAX_VALUE >0 ? charges/potdiff : undefined;
	} 
	
	presetMutualCapacities()
	{
		for( let r1=0; r1<this.rings.length; r1++)
		{
			this.mutualCapacities[r1] = [];
			for( let r2=0; r2<this.rings.length; r2++)
			{
				this.mutualCapacities[r1][r2] = null;
			}
		}
	}
	setMutualCapacities()
	{
		this.presetMutualCapacities();
		for( let r1=0; r1<this.rings.length; r1++)
		{
			for( let r2=r1+1; r2<this.rings.length; r2++)
			{
				if(r2 == this.rings.length-1 && r1 == 0)
				{
					// console.log([r2, r1]);
				}
				else
				{
					this.mutualCapacities[r1][r2] = this.capacityOfRings(r1, r2);
					this.mutualCapacities[r2][r1] = this.mutualCapacities[r1][r2];
				}
			}
		}
		//console.log(this.mutualCapacities);
	}
	viewMutualCapacities() // service method
	{
		// return HTML table
		if( Array.isArray(this.mutualCapacities)
		&& this.mutualCapacities.length != this.rings.length)
		{
			this.setMutualCapacities();
		}
		
		const uC = this.mutualCapacities[0][1];
		if(uC < Number.EPSILON * 1e-12){ return "Error: division by zero";}
		
		let rows = "<tr><th>i&#92;j</th><th> 0 </th><th> 1 </th><th> 2 </th><th> 0 </th></tr>";
		for( let row=0; row<this.mutualCapacities.length; row++)
		{
			rows += "<tr><th>"+row+"</th>";
			for( let col=0; col<this.mutualCapacities[row].length; col++)
			{
				let cell = this.mutualCapacities[row][col]/uC;
				cell = cell == 0 ? "": cell.toFixed(2);
				rows += "<td>"+ cell +"</td>";//.toPrecision(3)
			}
			rows += "</tr>";
		}
		return "<table>"+"<caption>"+
		"<h2>Capacity of rings[i][j]</h2>"+
		"<h3>"+(uC*1e12).toPrecision(3)+" pF = 1"+"</h3>"+
		"path = "+ (1/this.precision) +" steps"+
		"</caption>"+rows+"</table>";
	}	
	
	defaultpots()
	{
		let defpots = [];
		for( let ri=0; ri<this.rings.length; ri++ )
		{
			this.rings[ri].electrics.potential = 
				this.rings[ri].electrics.toppotential * 
				Math.cos(2*Math.PI*this.rings[ri].linephase);
			
			defpots.push(this.rings[ri].electrics.potential);
		}
  	console.log(defpots);
	}
	U2Q( existingpotentials = false )
	{
		if( existingpotentials == true ){}else{this.defaultpots();}
		
		// for validity checkup within loop
		let totQ = 0; //, minQ = Number.MAX_VALUE, maxQ=Number.MIN_VALUE;
		
		for(let i=0; i<this.rings.length; i++)
		{
			this.rings[i].electrics.charge = 0;
			for(let j=0; j<this.rings.length; j++)
			{
				let C = this.mutualCapacities[i][j]; // direction doesn't matter; C[i][j] = C[j][i] = C
				// // direction matters for rings.electrics.potential! +- goes from higher to lower index
				this.rings[i].electrics.charge += C==null 
					? 0 
					: C/2*( this.rings[j].electrics.potential-this.rings[i].electrics.potential ); 
			}
			// for validity checkup
			totQ += this.rings[i].electrics.charge; // should be zero
		}
		// vadidity checkup
		return totQ;
	}
	superpose(X,Y,Z)
	{
		// @param X,Y,Z global coordinates of sample point
		// return array Efieldvector: total electric field in (X,Y,Z)
		
		let Efieldvector=[0,0,0];
		for(let ri=0; ri<this.rings.length; ri++)
		{
			let ringphaseshift = Math.cos(this.rings[ri].linephase *2*Math.PI);
			let e = this.rings[ri].ringfield(X,Y,Z);
			
			Efieldvector[0] += e[0] * ringphaseshift;
			Efieldvector[1] += e[1] * ringphaseshift;
			Efieldvector[2] += e[2] * ringphaseshift;
		}
		return Efieldvector;
	}
	
	run( X,Y )
	{
		if( ! (Array.isArray(this.mutualCapacities)
		&& this.mutualCapacities.length == this.rings.length) )
		{
			this.setMutualCapacities();
		}
		this.U2Q();
		return this.superpose(X,Y,0);
	}
	
	pointField(X,Y){ return this.run( X,Y ); }
}
