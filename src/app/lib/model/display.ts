import {Vector as Vector3D} from "./3D/vector";

export interface Display {
  focalLength: number;
  center: Vector3D;
  rollAngle: number; /* x axis */
  pitchAngle: number; /* y axis */
  yawAngle: number; /* z axis */
  width: number;
  height: number;
}
