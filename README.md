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
The method ```capacityOfRings()``` invoking ```Q2V()``` establishes the mutual relation between charge and potential ( = capacity) of neighbouring rings.

#### rings
A ```Ring``` in  ```Ringtrain``` has
- (location) properties ```cx, cy, cz, linephase```, 
- metric properties ```ringRadius, draadstraal```,
- electrical properties ```potential, charge```.

The ring's ```electrics.charge``` is thought to be split in N=24 point charges spread evenly over the rings circumference. N can be set globally.\ 
For all x,y,z the ring's ```ringfield``` is the superposition of the E-fields of all N point charges.

#### Ringtrain
In a set of rings with ```linephases``` from 0 to 1
- rings with linephases 0 and 1 are identical, to mimic a circular ringtrain
- their ```electrics.charge```s add up to zero (according to the law of charge conservation).

##### 1. Establish all mutual capacities with ```setMutualCapacities()```
Iterate enough for the capacities to stabilise; \
```steps```=1000 does it for 3 rings spaced by 1 radius, and with precision of 4 digits.

##### 2. Apply potentials to the rings with .U2Q()
in such a way,
1. to close the loop, set the last ```ring``` of ```Ringtrain``` as identical to the first. \
2. electrically, the rings are modelled as &#39;one of the plates of capacitors&#39; \
in parallel connected to a point with a given potential. \
Thus ```ring[1]``` has potential V<sub>1</sub>,  ..., ```ring[n]``` has potential V<sub>n</sub>. \
Via capacitances C<sub>12</sub>, ..., C<sub>1n</sub> electrical charges Q<sub>12</sub>, ..., Q<sub>1n</sub> are built up: \
Q<sub>12</sub> = C<sub>12</sub>(V<sub>2</sub> - V<sub>1</sub>)/2, ..., Q<sub>1n</sub> = C<sub>1n</sub>(V<sub>n</sub> - V<sub>1</sub>)/2. \
(Factor 1/2 because ```ring```s represent only &#39;one plate of capacitors&#39;) \
3. all their ```electrics.charge```s add up to zero. \
