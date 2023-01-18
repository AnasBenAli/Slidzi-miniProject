import React from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from "cannon-es";
import { Canvas } from "@react-three/fiber";
import CannonDebugger from "cannon-es-debugger";
import { GUI } from "dat.gui";
import CarBody from "./Car";
import Fuel from "./Fuel";

class CarScene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0,
    };
  }
  generateFuelCluster = (amount) => {
    this.fuelTrails = [];
    for (var i = 0; i < amount; i++) {
      var fuelTrail = new Fuel({
        physicsWorld: this.physicsWorld,
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
  setUpFuelTrailsEventListeners = () => {
    this.fuelTrails.forEach((fuel) => {
      fuel.collider.addEventListener("collide", (e) => {
        if (e.body === this.boxBody) {
          this.scene.remove(fuel.mesh);
          this.physicsWorld.removeBody(fuel.collider);
          this.setState({ score: this.state.score + fuel.fuelAmount });
          console.log("Score: " + this.state.score);
        }
      });
    });
  };
  setUpEventListeners = () => {
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
    this.setUpFuelTrailsEventListeners();
  };
  loadModels = () => {
    this.loader.load("assets/Models/scene.gltf", (gltf) => {
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.castShadow = true;
      gltf.scene.receiveShadow = false;
      this.scene.add(gltf.scene);
      this.car = gltf;
    });
  };
  initializeGUI = () => {
    this.carWireframe = false;
    const gui = new GUI();
    const carFolder = gui.addFolder("Car Properties");
    const lightFolder = gui.addFolder("Directional Light Properties");
    const fuelFolder = gui.addFolder("Fuel Properties");
    const fuelFolderAnimation = fuelFolder.addFolder("Animation");

    carFolder.add(this, "force", 0, 100).name("Speed");
    carFolder
      .add(this, "carWireframe")
      .name("Wireframe")
      .onChange(() => {
        this.car.scene.traverse((child) => {
          if (!child.isMesh) return;
          child.material.wireframe = this.carWireframe;
        });
      });
    this.FuelProperties = {
      initialScale: 0.7,
      frequency: 1,
      amplitude: 0.05,
      color: 0xfaef29,
    };
    fuelFolder
      .addColor(this.FuelProperties, "color")
      .name("Color")
      .onChange(() => {
        this.fuelTrails.forEach((fuel) => {
          fuel.mesh.material.color.set(this.FuelProperties.color);
          
        });
      });
    fuelFolderAnimation
      .add(this.FuelProperties, "initialScale", 0, 1)
      .name("Initial Scale")
      .onChange(() => {
        this.fuelTrails.forEach((fuel) => {
          fuel.initialScale = this.FuelProperties.initialScale;
        });
      });
    fuelFolderAnimation
      .add(this.FuelProperties, "frequency", 1, 25)
      .name("Frequency")
      .onChange(() => {
        this.fuelTrails.forEach((fuel) => {
          fuel.frequency = this.FuelProperties.frequency / 100;
        });
      });
    fuelFolderAnimation
      .add(this.FuelProperties, "amplitude", 0, 0.5)
      .name("Amplitude")
      .onChange(() => {
        this.fuelTrails.forEach((fuel) => {
          fuel.amplitude = this.FuelProperties.amplitude;
        });
      });
    

    //Manage properties of directional light
    lightFolder.add(this.light, "visible").name("Enable");
    lightFolder.add(this.light, "intensity", 0, 1).name("Intensity");
    lightFolder.add(this.light.position, "x", -100, 100).name("Position X");
    lightFolder.add(this.light.position, "y", -100, 100).name("Position Y");
    lightFolder.add(this.light.position, "z", -100, 100).name("Position Z");
    lightFolder.addColor(this.light, "color").name("Color");
  };

  initializeVariables = () => {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.physicsWorld = new CANNON.World();
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
    });
    this.axesHelper = new THREE.AxesHelper(8);
    this.loader = new GLTFLoader();
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

  documentInit = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight); //
    document.body.replaceChild(
      this.renderer.domElement,
      document.body.childNodes[0]
    );
  };

  initialize = () => {
    this.initializeVariables();
    this.documentInit();
    this.loadModels();
    this.initializeGUI();
    this.generateFuelCluster(100);

    this.setUpEventListeners();

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
  };

  handleAnimations = () => {
    this.animateFuel();
  };

  update = () => {
    requestAnimationFrame(this.update);
    this.handleAnimations();
    if (this.car) {
      const carPosition = {
        x: this.boxBody.position.x,
        y: this.boxBody.position.y,
        z: this.boxBody.position.z,
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
    this.update();
  }

  render() {
    return <Canvas />;
  }
}
export default CarScene;
