import {Vector as Vector3D} from "./3D/vector";

export interface Display {
  focusPoint: Vector3D;
  center: Vector3D;
  horizontalPlaneAngle: number;
  width: number;
  height: number;
}
