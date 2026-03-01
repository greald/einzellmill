// static electric field of N-pointed Rings
// physical parameters in ISO units (m,kg,C)
const epsilon0 = 8.854188e-12; // console.log(epsilon0);// F/m = C/Vm};

class Ring // (cx,cy,cz,linephase)
{
	// static electrical field of one ring
	constructor(cx,cy,cz, linephase)
	{
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
			charge: Math.cos(2*Math.PI*this.linephase) * epsilon0 
			}
	}
	
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
		// to avoid division by zero
		const LITTLEENOUGH = Number.MIN_VALUE;
		let hyp = 
			sqhyp <= LITTLEENOUGH 
			? LITTLEENOUGH 
			: sqhyp**0.5;//Math.sqrt(sqhyp) ;

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
	}
	
	// Q2U(): given charges // return: potential difference from one ring to another (V)
	Q2U(rinx1, rinx2, steps=10)
	{
		// path from rings this.rings[rinx1] and this.rings[rinx2] ...
		// ... along x=dx, y=this.rings[rinx1].metrics.ringRadius, z=0
		let path =
			this.rings[rinx2].cx - this.rings[rinx2].metrics.draadstraal -
			this.rings[rinx1].cx + this.rings[rinx1].metrics.draadstraal;
//	console.log("path "+rinx2+"-"+rinx1+" "+ path);
		let step = path / steps;
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
/*  console.log("charge "+rinx2+"-"+rinx1+" "+
	    (this.rings[rinx2].electrics.charge   -   this.rings[rinx1].electrics.charge) +
			" ");*/
//    console.log("potential difference "+rinx2+"-"+rinx1+" "+ (potx - pot[0]).toPrecision(4));
		return potx - pot[0];
	}
	
	capacityOfRings(rinx1, rinx2, steps=10) // C=Q/V
	{
//	console.log(JSON.stringify(this.rings));
		const oriloads = [this.rings[rinx1].electrics.charge, this.rings[rinx2].electrics.charge];
		// Load test charges
		this.rings[rinx2].electrics.charge = 1;//epsilon0;
		this.rings[rinx1].electrics.charge = -1;//epsilon0;
//	console.log(JSON.stringify(this.rings));
		
		let potdiff = this.Q2U(rinx1, rinx2, steps);
//	console.log(potdiff);
		let charges = this.rings[rinx2].electrics.charge - this.rings[rinx1].electrics.charge;
		
		// Restore charges
		this.rings[rinx2].electrics.charge = oriloads[1];
		this.rings[rinx1].electrics.charge = oriloads[0];
//	console.log(JSON.stringify(this.rings));
		
		// dont divide by zero
		return potdiff !== 0 ? charges/potdiff : undefined;
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
	setMutualCapacities(steps = 10000)
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
					this.mutualCapacities[r1][r2] = this.capacityOfRings(r1, r2, steps);
					this.mutualCapacities[r2][r1] = this.mutualCapacities[r1][r2];
				}
			}
		}
		//console.log(this.mutualCapacities);
	}
	
	defaultpots()
	{
		let defpots = [];
		for( let ri=0; ri<this.rings.length; ri++ )
		{
			defpots.push(this.rings[ri].electrics.toppotential * Math.cos(2*Math.PI*this.rings[ri].linephase) );
		}
		return defpots;
	}
	U2Q( pots = [])
	{
		if(Array.isArray(pots) && pots.length==0){ pots = this.defaultpots();}
		if( this.rings.length != pots.length ){let err="Error: invalid parameter pots"; console.log(err); alert(err); return;} 
		if( pots[0] != pots.at(-1) ){let err="Error: last of pots != first"; console.log(err); alert(err); return;}
		let err="Correct parameter pots. Move on."; console.log(err);// alert(err); //return;
		
		// for quality checkup
		let totQ = 0, minQ = Number.MAX_VALUE, maxQ=Number.MIN_VALUE;
		
		for(let i=0; i<pots.length; i++)
		{
			this.rings[i].electrics.charge = 0;
			for(let j=0; j<pots.length; j++)
			{
				let C = this.mutualCapacities[i][j]; // direction doesn't matter; C[i][j] = C[j][i] = C
				// // direction matters for pots! +- goes from higher to lower index
				this.rings[i].electrics.charge += C==null ? 0 : C/2*(pots[j]-pots[i]); 
			}
			
			// for quality checkup
			minQ = Math.min(this.rings[i].electrics.charge, minQ);
			maxQ = Math.max(this.rings[i].electrics.charge, maxQ);
			totQ += this.rings[i].electrics.charge;
		}
		// quality checkup
		return totQ +" / "+(maxQ-minQ)+" =?= ca 0";
	}
	
	capOfRingWithNext(rinx1, rinx2) 
	{
		// Jeroen zegt: epsilon0 * pi * (R^2) / x
		cap = epsilon0 * Math.PI * RingRadius**2 / ringAfstand;
		return cap;
	}
	
	// charge: given potentials and capacities
	charge(potentials=[]) // @param potentials.length == this.rings.length; 
	{
		for(let r=0; r<this.rings.length; r++){ this.rings[r].electrics.charge=0; }
		let devv = potentials[0] - potentials[potentials.length-1];
		if( potentials.length == this.rings.length
		&& Math.abs(devv)<.0001)
		{} else { this.errors.push('system error: potentials don&#39;t match to rings!');}// return; }
		
		for( let v=0; v<potentials.length; v++ )
		{
			let vl = v==0 ? potentials.length-1 : v-1;
			let vr = v<=potentials.length-1 ? 0 : v+1;
			
			let cap = this.capOfRingWithNext(0,1) ;
//    console.log("operational capacity " + cap + " F" );
			let potburen = potentials[vl] + potentials[vr];
			
			this.rings[v].electrics.charge = cap * ( potentials[v] - (potburen)/2 ); 
//		console.log(this.rings[v].electrics.charge);
		}
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
}