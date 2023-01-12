import React from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from "cannon-es";
import studio from "@theatre/studio";
import * as core from "@theatre/core";
import extension from "@theatre/r3f/dist/extension";
import { Canvas } from "@react-three/fiber";
import { SheetProvider } from "@theatre/r3f";
import CannonDebugger from "cannon-es-debugger";

class Fuel extends React.Component {
  constructor(props) {
    super(props);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xfaef29 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.state = {
      fuel: 100,
    };
  }
  animate() {
    try {
      if (this.mesh) {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
        this.props.renderer.render(this.props.scene, this.props.camera);
        requestAnimationFrame(this.animate);
      }
    } catch (error) {}
  }
  render() {
    return (
      <group>
        <mesh
          position={this.props.position}
          rotation={this.props.rotation}
          scale={this.props.scale}
          mesh={this.props.mesh}
          castShadow
          receiveShadow
        >
          <boxBufferGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </group>
    );
  }
}
export default Fuel;
