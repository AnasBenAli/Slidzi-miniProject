import React from "react";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import Scene from "./Scene";

class Fuel extends React.Component {
  constructor(props) {
    super(props);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xfaef29 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.boxCollider = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5)),
      isTrigger: true,
    });
    this.state = {
      fuel: 100,
    };
    this.props.physicsWorld.addBody(this.boxCollider);
    this.boxCollider.addEventListener("collide", (e) => {
     
        if (e.body === this.props.carCollider) {
          this.props.scene.remove(this.mesh);
          this.props.physicsWorld.removeBody(this.boxCollider);
        }
     
    });
  }
  Update() {
    try {
      if (this.mesh) {
        this.boxCollider.position.copy(this.mesh.position);
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
      }
    } catch (error) {}
  }
  render() {
    return;
  }
}
export default Fuel;
