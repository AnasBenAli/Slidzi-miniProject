import * as CANNON from "cannon-es";
import React from "react";

class CarBody extends React.Component {
  constructor(boxBody) {
    super();
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
    this.vehicle = vehicle;
  }
}

export default CarBody;
