import {Vector as Vector3D} from "./3D/vector";

export interface Display {
  focalLength: number;
  center: Vector3D;
  horizontalPlaneYAngle: number; /* Pitch axis */
  horizontalPlaneZAngle: number; /* Roll axis */
  width: number;
  height: number;
}
