import * as THREE from "three";
import * as CANNON from "cannon-es";

class Fuel{
  constructor(props) {
    const geometry = new THREE.SphereGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xfaef29 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.collider = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Sphere(1),
      isTrigger: true,
    });
    this.fuelAmount= 2;
    props.physicsWorld.addBody(this.collider);
    //set the mesh's rotation to a random value
    this.mesh.rotation.x = Math.random() * 2 * Math.PI;
    this.mesh.rotation.y = Math.random() * 2 * Math.PI;
    this.mesh.rotation.z = Math.random() * 2 * Math.PI;
    //set a random initial scale between 0.5 and 2
    this.initialScale = Math.random() * 1.5 + 0.5;
    this.frequency = 0.002;
    this.amplitude = 0.05;
  }
  Update() {
    try {
      if (this.mesh) {
        this.collider.position.copy(this.mesh.position);
        this.collider.scale = this.initialScale;
        //ocilating the fuel's scale
        this.mesh.scale.x = this.initialScale  + Math.sin(Date.now() * this.frequency) * this.amplitude;
        this.mesh.scale.y = this.initialScale  + Math.sin(Date.now() * this.frequency) * this.amplitude;
        this.mesh.scale.z = this.initialScale  + Math.sin(Date.now() * this.frequency) * this.amplitude;
      }
    } catch (error) {}
  }
}
export default Fuel;
