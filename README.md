# einzellmill
## numerical simulation for moving einzell lens field
The simulation set up is a series of parallel conducting rings.
Each carrying a 10MHz, 30kV, 3-phase potential, so as to create a moving electric field.

Physically the rings are placed around a low pressure plasma of charged particles.
The moving field is to concentrate the particles and to contain the plasma in de centres between the rings.
It's a method proven innumerously often, be it in reverse: \
in cathode ray tubes the particles were moving and the field was stationary.

The simulation is to study and control the movement of charged particles.

### Particle
A particle of class ```Particle``` has properties
for ```mass``` and ```charge```,
for location ```x, y, z```, velocity ```vx, vy, vz```.
It has a method for acceleration ```accelerate(E, t)```
as a function of the local electric field ```E``` over a time span ```t```.
This modifies its velocity and location.

### Ringtrain
The electric field is generated in a series of rings as properties of class ```Ringtrain```.

#### Rings
A ```Ring``` in  ```Ringtrain``` has
- (location) properties ```cx, cy, cz, linephase```, 
- ```metrics``` properties ```ringRadius, draadstraal```,
- ```electrics``` properties ```potential, charge```.

The ring's ```electrics.charge``` is thought to be split in ```N```=24 point charges spread evenly over the rings circumference. ```N``` can be set globally. \
For any x,y,z the ring's ```ringfield``` is the superposition of the E-fields of all of its ```N``` point charges.

#### Capacitances
The method ```capacityOfRings()``` invoking ```.Q2U()``` invoking ```potFromIncrEds()``` establishes the mutual relation between charge and potential ( = capacity) of all rings in play:
- Applying <!--Laplace's specification of Poisson's rule:\
∇²V=0 in empty space => ∇V = constant locally.\
But just using -->∇V = -E by definition,
- summing ```ringfield```s along the path\
from x on first ring to the other and (y = ringRadius, z = 0)
- ```potFromIncrEds()``` sets the potential difference of rings given dummy charges,
- optimised dynamically to required ```precision``` in ```Q2U()```, while minimizing the number of iterations.
- Then ```capacityOfRings()``` returns the capacity from C=Q/V for any pair of ```ring```s\
and ```setMutualCapacities()``` stores them all in Array ```mutualCapacities```.

#### Charges from potentials
In a set of rings with ```linephases``` from 0 to 1 (corresponding to 0 to 2&pi;)
- rings with linephases 0 and 1 are identical, to mimic a circular ringtrain
- their ```electrics.charge```s add up to zero (according to the Conservation Law of Charge).

##### 1. Establish all mutual capacities with ```setMutualCapacities()```
Applying ```capacityOfRings()``` for all pairs of ```ring```s.

##### 2. Charges from potentials with U2Q()
1. To close the loop, set the last ```ring``` of ```Ringtrain``` as identical to the first.
2. electrically, the rings are modelled as nodes with *given potentials*: V<sub>i</sub>.\
Thus ```ring[1]``` has potential V<sub>1</sub>,  ..., ```ring[n]``` has potential V<sub>n</sub>.\
These nodes all are connected via capacitances in parallel C<sub>ij</sub> = C<sub>ji</sub>, in ```mutualCapacities```.\
Mimic them as capacitors with two plates, charged with C<sub>ij</sub> &times; (V<sub>i</sub> - V<sub>j</sub>).
3. *Assume* both plates have half of the capacitor's charge, opposite to each other's:\
Q<sub>ij</sub> = 1/2 &times; C<sub>ij</sub> &times; (V<sub>i</sub> - V<sub>j</sub>)\
and\
Q<sub>ji</sub> = 1/2 &times; C<sub>ji</sub> &times; (V<sub>j</sub> - V<sub>i</sub>).\
Direction matters!\
Then ```ring[i]``` will be charged in total with the sum of all Q<sub>ij</sub>.
4. Returns checksum whether all their ```electrics.charge```s add up to zero.

#### Wrap it all up
```Ringtrain```'s method ```pointField()``` wrapps it all up,
1. setting all mutual capacitances from dummy charges, in ```setMutualCapacities()```;
2. applying them to have ```U2Q()``` set the rings' charges from externally given potentials;
3. sums all ```ringfield```s in ```superpose()```;\
and returns a resulting electric field vector in any X, Y, Z=0.
