// ISO defaults
const ringRadius = 0.015; // = 1.5 cm
const ringAfstand = 2*ringRadius; // = ringafstand / ringstraal
const draadstraal = .001; // m

const topSpanning = 30000 / Math.sqrt(2); // V 

const fullcycletime = 1e-7; // s = 1/Hz, so 1/10 MHz

// N: number of segments any Ring is virtually cut into
//var N = N==undefined ? 24 : N;
// radius of any Ring
//var R = R==undefined ? 0.03 : R; 
// electrical charge of any Ring with linephase 1
//var Q = Q==undefined ? 1 : Q;