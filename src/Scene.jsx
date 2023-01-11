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

studio.initialize();
studio.extend(extension);
const project = core.getProject("My Project");

const sheet = project.sheet("My Sheet");

const physicsWorld = new CANNON.World();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.replaceChild(renderer.domElement, document.body.childNodes[0]);
//Create a DirectionalLight and turn on shadows for the light
const light = new THREE.DirectionalLight(0xffffff, 1);
//Create a sphere that cast shadows (but does not receive them)
const cannonDebugger = new CannonDebugger(scene, physicsWorld, {
  color: 0xff0000,
});
const axesHelper = new THREE.AxesHelper(8);
scene.add(axesHelper);

const loader = new GLTFLoader();
var car;
loader.load("assets/Models/scene.gltf", function (gltf) {
  gltf.scene.scale.set(1, 1, 1);
  gltf.scene.castShadow = true;
  gltf.scene.receiveShadow = false;
  scene.add(gltf.scene);
  car = gltf;
});
const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
});

const craneCam = sheet.object("Crane Cam", {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  fov: 75,
  zoom: 1,
  near: 0.1,
  far: 90,
});
const carTransform = sheet.object("Car Properties", {
  speed: 10,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  boxColliderScale: { x: 0, y: 0, z: 0 },
  colliderOffset: { x: 0, y: 0, z: 0 },
});

var force = 10;
//add event listener for WASD input
document.addEventListener("keydown", (event) => {
  if (car) {
    const keyName = event.key;
    
    const steering = Math.PI / 8;
    if (keyName === "w") {
      vehicle.setWheelForce(force, 0);
      vehicle.setWheelForce(force, 1);
    } else if (keyName === "s") {
      vehicle.setWheelForce(-force / 2, 0);
      vehicle.setWheelForce(-force / 2, 1);
    } else if (keyName === "a") {
      vehicle.setSteeringValue(steering, 0);
      vehicle.setSteeringValue(steering, 2);
    } else if (keyName === "d") {
      vehicle.setSteeringValue(-steering, 0);
      vehicle.setSteeringValue(-steering, 2);
    }
  }
});
document.addEventListener("keyup", (event) => {
  if (car) {
    const keyName = event.key;
    if (keyName === "w") {
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 1);
    } else if (keyName === "s") {
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 1);
    } else if (keyName === "a") {
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 2);
    } else if (keyName === "d") {
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 2);
    }
  }
});

carTransform.onValuesChange((values) => {
  if (car) {
    car.scene.position.set(
      values.position.x + values.colliderOffset.x,
      values.position.y + values.colliderOffset.y,
      values.position.z + values.colliderOffset.z
    );
    car.scene.rotation.set(
      values.rotation.x,
      values.rotation.y,
      values.rotation.z
    );
    force = values.speed;

    boxBody.removeShape(boxBody.shapes[0]);
    boxBody.addShape(
      new CANNON.Box(
        new CANNON.Vec3(
          values.boxColliderScale.x,
          values.boxColliderScale.y,
          values.boxColliderScale.z
        )
      )
    );
    boxBody.updateBoundingRadius();
  }
});
craneCam.onValuesChange((values) => {
  camera.position.set(values.position.x, values.position.y, values.position.z);
  camera.rotation.set(values.rotation.x, values.rotation.y, values.rotation.z);
  camera.fov = values.fov;
  camera.zoom = values.zoom;
  camera.near = values.near;
  camera.far = values.far;
  camera.updateProjectionMatrix();
});
const boxBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(2.5, 1.5, 6.2)),
});

const vehicle = new CANNON.RigidVehicle({
  chassisBody: boxBody,
});

const wheelShape = new CANNON.Sphere(0.75);
const wheelMaterial = new CANNON.Material("wheel");
const axisWidth = 5;
const dowmDir = new CANNON.Vec3(0, -1, 0);
const mass = 1;
const wheelsHeight = -0.8;
const axis = new CANNON.Vec3(1, 0, 0);
const wheelBody = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody.addShape(wheelShape);
wheelBody.angularDamping = 0.1;
vehicle.addWheel({
  body: wheelBody,
  position: new CANNON.Vec3(3.5, wheelsHeight, 1.5 + axisWidth / 2),
  axis: axis,
  direction: dowmDir,
});
const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody2.addShape(wheelShape);
wheelBody2.angularDamping = 0.1;
vehicle.addWheel({
  body: wheelBody2,
  position: new CANNON.Vec3(-3.5, wheelsHeight, -1.5 - axisWidth / 2),
  axis: axis,
  direction: dowmDir,
});

const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody3.addShape(wheelShape);
wheelBody3.angularDamping = 0.1;
vehicle.addWheel({
  body: wheelBody3,
  position: new CANNON.Vec3(-3.5, wheelsHeight, 1.5 + axisWidth / 2),
  axis: axis,
  direction: dowmDir,
});
const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody4.addShape(wheelShape);
wheelBody4.angularDamping = 0.1;
vehicle.addWheel({
  body: wheelBody4,
  position: new CANNON.Vec3(3.5, wheelsHeight, -1.5 - axisWidth / 2),
  axis: axis,
  direction: dowmDir,
});

class Scene extends React.Component {
  CreateScene() {
    function init() {
      physicsWorld.gravity.set(0, -9.82, 0); // m/s²
      groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
      physicsWorld.addBody(groundBody);

      boxBody.position.set(0, 15, 0);
      vehicle.addToWorld(physicsWorld);
      physicsWorld.addBody(boxBody);

      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
      scene.background = new THREE.Color(0xffffff);
      camera.position.set(
        1.1961405848726208,
        8.70856294293378,
        20.495177820751316
      );
      //Set up shadow properties for the light
      light.shadow.mapSize.width = 512; // default
      light.shadow.mapSize.height = 512; // default
      light.shadow.camera.near = 0.5; // default
      light.shadow.camera.far = 500; // default

      light.position.set(1, 1, 1); //default; light shining from top
      light.castShadow = true; // default false
      scene.add(light);
    }

    function Update() {
      if (car) {
        car.scene.position.set(
          boxBody.position.x + carTransform.value.colliderOffset.x,
          boxBody.position.y + carTransform.value.colliderOffset.y,
          boxBody.position.z + carTransform.value.colliderOffset.z
        );
        car.scene.quaternion.set(
          boxBody.quaternion.x,
          boxBody.quaternion.y,
          boxBody.quaternion.z,
          boxBody.quaternion.w
        );
      }
      physicsWorld.fixedStep();
      requestAnimationFrame(Update);
      //cannonDebugger.update();
      renderer.render(scene, camera);
    }
    init();
    Update();
  }

  render() {
    return (
      <Canvas>
        <SheetProvider sheet={sheet}>{this.CreateScene()}</SheetProvider>
      </Canvas>
    );
  }
}

export default Scene;
