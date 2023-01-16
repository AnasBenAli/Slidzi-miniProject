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
import CarBody from "./Car";
import Fuel from "./Fuel";

var score = 0;

class CarScene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  generateFuelCluster = (amount) => {
    this.fuelTrails = [];
    for (var i = 0; i < amount; i++) {
      var fuelTrail = new Fuel({
        physicsWorld: this.physicsWorld,
        scene: this.scene,
        carCollider: this.boxBody,
      });
      fuelTrail.mesh.position.set(
        Math.random() * 100 - 50,
        3,
        Math.random() * 100 - 50
      );
      this.scene.add(fuelTrail.mesh);
      this.fuelTrails.push(fuelTrail);
    }
  };
  animateFuel = () => {
    this.fuelTrails.forEach((fuelTrail) => {
      fuelTrail.Update();
    });
  };
  SetUpOnValueChange = () => {
    this.carTransform.onValuesChange((values) => {
      if (this.car) {
        this.car.scene.position.set(
          values.position.x + values.colliderOffset.x,
          values.position.y + values.colliderOffset.y,
          values.position.z + values.colliderOffset.z
        );
        this.car.scene.rotation.set(
          values.rotation.x,
          values.rotation.y,
          values.rotation.z
        );
        this.force = values.speed;
      }
    });
    this.craneCam.onValuesChange((values) => {
      this.camera.position.set(
        values.position.x,
        values.position.y,
        values.position.z
      );
      this.camera.rotation.set(
        values.rotation.x,
        values.rotation.y,
        values.rotation.z
      );
      this.camera.fov = values.fov;
      this.camera.zoom = values.zoom;
      this.camera.near = values.near;
      this.camera.far = values.far;
      this.camera.updateProjectionMatrix();
    });
  };
  SetUpEventListeners = () => {
    document.addEventListener("keydown", (event) => {
      if (this.car) {
        const keyName = event.key;

        const steering = Math.PI / 8;
        if (keyName === "w" || keyName === "z") {
          this.vehicle.setWheelForce(this.force, 0);
          this.vehicle.setWheelForce(this.force, 1);
        } else if (keyName === "s") {
          this.vehicle.setWheelForce(-this.force / 2, 0);
          this.vehicle.setWheelForce(-this.force / 2, 1);
        } else if (keyName === "a" || keyName === "q") {
          this.vehicle.setSteeringValue(steering, 0);
          this.vehicle.setSteeringValue(steering, 2);
        } else if (keyName === "d") {
          this.vehicle.setSteeringValue(-steering, 0);
          this.vehicle.setSteeringValue(-steering, 2);
        }
      }
    });
    document.addEventListener("keyup", (event) => {
      if (this.car) {
        const keyName = event.key;
        if (keyName === "w" || keyName === "z") {
          this.vehicle.setWheelForce(0, 0);
          this.vehicle.setWheelForce(0, 1);
        } else if (keyName === "s") {
          this.vehicle.setWheelForce(0, 0);
          this.vehicle.setWheelForce(0, 1);
        } else if (keyName === "a" || keyName === "q") {
          this.vehicle.setSteeringValue(0, 0);
          this.vehicle.setSteeringValue(0, 2);
        } else if (keyName === "d") {
          this.vehicle.setSteeringValue(0, 0);
          this.vehicle.setSteeringValue(0, 2);
        }
      }
    });
  };
  LoadModels = () => {
    this.loader.load("assets/Models/scene.gltf", (gltf) => {
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.castShadow = true;
      gltf.scene.receiveShadow = false;
      this.scene.add(gltf.scene);
      this.car = gltf;
    });
  };
  initializeVariables = () => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.project = core.getProject("My Project");
    this.sheet = this.project.sheet("My Sheet");
    this.physicsWorld = new CANNON.World();
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
    });
    this.axesHelper = new THREE.AxesHelper(8);
    this.loader = new GLTFLoader();
    this.craneCam = this.sheet.object("Crane Cam", {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      fov: 75,
      zoom: 1,
      near: 0.1,
      far: 90,
    });
    this.carTransform = this.sheet.object("Car Properties", {
      speed: 10,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      boxColliderScale: { x: 0, y: 0, z: 0 },
      colliderOffset: { x: 0, y: 0, z: 0 },
    });
    this.boxBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(2.5, 1.5, 6.2)),
    });
    this.groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
    });
    this.vehicle = new CarBody(this.boxBody).vehicle;
    this.fuelTrails = [];
    this.isInitialized = false;
    this.car = null;
    this.force = 10;
    this.cannonDebugger = new CannonDebugger(this.scene, this.physicsWorld, {
      color: 0xff0000,
    });

    this.light = new THREE.DirectionalLight(0xffffff, 1);
  };

  DocumentInit = () =>{
    this.renderer.setSize(window.innerWidth, window.innerHeight); //
    document.body.replaceChild(
      this.renderer.domElement,
      document.body.childNodes[0]
    );
  }

  initialize = () => {
    studio.initialize();

    this.initializeVariables();
    this.DocumentInit();
    this.SetUpEventListeners();
    this.LoadModels();

    this.physicsWorld.gravity.set(0, -9.82, 0); // m/s²
    this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.physicsWorld.addBody(this.groundBody);

    this.boxBody.position.set(0, 15, 0);
    this.vehicle.addToWorld(this.physicsWorld);
    this.physicsWorld.addBody(this.boxBody);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    this.scene.background = new THREE.Color(0xffffff);
    this.camera.position.set(
      1.1961405848726208,
      8.70856294293378,
      20.495177820751316
    );

    this.camera.quaternion.set(
      this.boxBody.quaternion.x,
      this.boxBody.quaternion.y,
      this.boxBody.quaternion.z,
      this.boxBody.quaternion.w
    );

    var lightShadow = this.light.shadow;
    lightShadow.mapSize.width = 512; // default
    lightShadow.mapSize.height = 512; // default
    lightShadow.camera.near = 0.5; // default
    lightShadow.camera.far = 500; // default

    this.light.position.set(1, 1, 1); //default; this.light shining from top
    this.light.castShadow = true; // default false
    this.scene.add(this.light);

    this.scene.add(this.axesHelper);

    this.isInitialized = true;

    this.generateFuelCluster(10);
  };

  handleAnimations = () => {
    this.animateFuel();
  };

  Update = () => {
    requestAnimationFrame(this.Update);
    this.handleAnimations();
    if (this.car) {
      const carPosition = {
        x: this.boxBody.position.x + this.carTransform.value.colliderOffset.x,
        y: this.boxBody.position.y + this.carTransform.value.colliderOffset.y,
        z: this.boxBody.position.z + this.carTransform.value.colliderOffset.z,
      };
      this.car.scene.position.set(carPosition.x, carPosition.y, carPosition.z);
      this.car.scene.quaternion.set(
        this.boxBody.quaternion.x,
        this.boxBody.quaternion.y,
        this.boxBody.quaternion.z,
        this.boxBody.quaternion.w
      );
      this.camera.position.set(
        carPosition.x,
        carPosition.y + 5,
        carPosition.z + 20
      );
    }
    try {
      this.physicsWorld.fixedStep();
    } catch (error) {}
    //this.cannonDebugger.update();
    this.renderer.render(this.scene, this.camera);
  };

  componentDidMount() {
    if (!this.isInitialized) this.initialize();
    this.Update();
  }

  render() {
    return <Canvas></Canvas>;
  }
}
export default CarScene;
