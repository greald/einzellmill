# einzellmill
## numerical simulation for moving einzell lens field
The simulation set up is a series of parallel conducting rings.
Each carrying a 10MHz, 30kV, 3-phase potential, so as to create a moving electric field.

The rings are placed around a low pressure plasma of charged particles.
The moving field is to concentrate the particles and to contain the plasma in de centres between the rings.
It's a method proven innumerously often in reverse. In cathode ray tubes the particles were moving and the field was stationary.

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
The method ```capacityOfRings``` invoking ```Q2V``` establishes the mutual relation between charge and potential ( = capacity) of neighbouring rings.
