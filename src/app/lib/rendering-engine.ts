import {Polygon as Polygon3D} from "./model/3D/polygon";
import {Polygon as Polygon2D} from "./model/2D/polygon";
import {Vector as Vector3D} from "./model/3D/vector";
import {Vector as Vector2D} from "./model/2D/vector";
import {Coefficients as Coefficients3D} from "./model/3D/coefficients";
import {Display} from "./model/display";

export class RenderingEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;

  private readonly display: Display;

  private readonly polygons3D: Polygon3D[] = [];

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const context: CanvasRenderingContext2D | null = this.canvas.getContext('2d');

    if (!context) {
      throw Error('Canvas context not found');
    }

    this.context = context;

    this.display = {
      focalLength: 50,
      center: { x: 0, y: 0, z: 0 },
      horizontalPlaneXAngle: 0,
      horizontalPlaneYAngle: 0,
      horizontalPlaneZAngle: 0,
      width: this.canvas.width,
      height: this.canvas.height,
    }
  }

  public moveCamera(delta: Vector3D): void {
    this.display.center.x += delta.x;
    this.display.center.y += delta.y;
    this.display.center.z += delta.z;

    this.renderScene();
  }

  public setCameraAngles(x: number, y: number, z: number): void {
    this.display.horizontalPlaneXAngle = x;
    this.display.horizontalPlaneYAngle = y;
    this.display.horizontalPlaneZAngle = z;

    this.renderScene();
  }

  public setFocalLength(focalLength: number): void {
    this.display.focalLength = focalLength;

    this.renderScene();
  }

  public add3DPolygon(polygon3D: Polygon3D): void {
    this.polygons3D.push(polygon3D);

    this.renderScene();
  }

  private renderScene(): void {
    const polygons2D: Polygon2D[] = RenderingEngine.project3DPolygons(this.display, this.polygons3D);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.render2DPolygons(polygons2D);
  }

  private render2DPolygons(polygons2D: Polygon2D[]): void {
    this.context.beginPath();

    polygons2D.forEach((polygon2D: Polygon2D): void => {
      const firstCoordinate: Vector2D = this.normalizeCoordinate(polygon2D.coordinates[0]);

      this.context.moveTo(firstCoordinate.x, firstCoordinate.y);

      for (let i = 1; i < polygon2D.coordinates.length; i++) {
        const coordinate: Vector2D = this.normalizeCoordinate(polygon2D.coordinates[i]);

        this.context.lineTo(coordinate.x, coordinate.y);
      }

      this.context.lineTo(firstCoordinate.x, firstCoordinate.y);
    });

    this.context.stroke();
  }

  private normalizeCoordinate(coordinate: Vector2D): Vector2D {
    return {
      x: coordinate.x + this.display.width / 2,
      y: -coordinate.y + this.display.height / 2,
    };
  }

  private static coefficientsOfPlane(normalVector: Vector3D, { x, y, z }: Vector3D): Coefficients3D {
    const a: number = normalVector.x;
    const b: number = normalVector.y;
    const c: number = normalVector.z;

    return {
      a,
      b,
      c,
      d: a*x + b*y + c*z,
    };
  }

  private static distanceFromPointToPlane({x, y, z}: Vector3D, {a, b, c, d}: Coefficients3D): number {
    const numerator: number = a*x + b*y + c*z + d;
    const denominator: number = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2));

    return numerator / denominator;
  }

  private static normalVectorOfPlane(center: Vector3D, angle1: number, angle2: number): Vector3D {
    const angle1Radians: number = (Math.PI * angle1) / 180;
    const angle2Radians: number = (Math.PI * angle2) / 180;

    const referencePoint: Vector3D = {
      x: center.x + Math.cos(angle2Radians) * (-Math.cos(angle1Radians)),
      y: center.y + Math.sin(angle2Radians) * (-Math.cos(angle1Radians)),
      z: center.z + Math.sin(angle1Radians)
    };

    return RenderingEngine.subtractPoints(referencePoint, center);
  }

  private static rotateVector({ x, y, z }: Vector3D, axis: 'x' | 'y' | 'z', angle: number): Vector3D {
    const angleRadian: number = (Math.PI * angle) / 180;

    const sinAlpha: number = Math.sin(angleRadian);
    const cosAlpha: number = Math.cos(angleRadian);

    switch (axis) {
      case 'x':
        /*
        * |1     0           0| |x|   |        x        |   |x'|
        * |0   cos θ    −sin θ| |y| = |y cos θ − z sin θ| = |y'|
        * |0   sin θ     cos θ| |z|   |y sin θ + z cos θ|   |z'|
        */
        return {
          x,
          y: y*cosAlpha - z*sinAlpha,
          z: y*sinAlpha + z*cosAlpha
        };
      case 'y':
        /*
        * | cos θ    0   sin θ| |x|   | x cos θ + z sin θ|   |x'|
        * |   0      1       0| |y| = |         y        | = |y'|
        * |−sin θ    0   cos θ| |z|   |−x sin θ + z cos θ|   |z'|
        * */
        return {
          x: x*cosAlpha + z*sinAlpha,
          y,
          z: -x*sinAlpha + z*cosAlpha
        };
      case 'z':
        /*
        * |cos θ   −sin θ   0| |x|   |x cos θ − y sin θ|   |x'|
        * |sin θ    cos θ   0| |y| = |x sin θ + y cos θ| = |y'|
        * |  0       0      1| |z|   |        z        |   |z'|
        * */
        return {
          x: x*cosAlpha - y*sinAlpha,
          y: x*sinAlpha + y*cosAlpha,
          z
        };
    }

  }

  private static subtractPoints(point1: Vector3D, point2: Vector3D): Vector3D {
    return {
      x: point1.x - point2.x,
      y: point1.y - point2.y,
      z: point1.z - point2.z,
    };
  }

  private static project3DPolygons(display: Display, polygons3D: Polygon3D[]): Polygon2D[] {
    return polygons3D.map((polygon3D: Polygon3D): Polygon2D => {
      let xzPlaneNormal: Vector3D = { x: 0, y: 1, z: 0 };
      xzPlaneNormal = RenderingEngine.rotateVector(xzPlaneNormal, 'x', display.horizontalPlaneXAngle);
      xzPlaneNormal = RenderingEngine.rotateVector(xzPlaneNormal, 'z', display.horizontalPlaneZAngle);

      let yzPlaneNormal: Vector3D = RenderingEngine.rotateVector(xzPlaneNormal, 'z', 90);
      yzPlaneNormal = RenderingEngine.rotateVector(yzPlaneNormal, 'y', display.horizontalPlaneYAngle);

      let xyPlaneNormal: Vector3D = RenderingEngine.rotateVector(xzPlaneNormal, 'x', 90);
      xyPlaneNormal = RenderingEngine.rotateVector(xyPlaneNormal, 'y', display.horizontalPlaneYAngle);

      const xzPlane: Coefficients3D = RenderingEngine.coefficientsOfPlane(xzPlaneNormal, display.center);
      const yzPlane: Coefficients3D = RenderingEngine.coefficientsOfPlane(yzPlaneNormal, display.center);
      const xyPlane: Coefficients3D = RenderingEngine.coefficientsOfPlane(xyPlaneNormal, display.center);

      const coordinates2D: Vector2D[] = polygon3D.coordinates.map((coordinate: Vector3D): Vector2D => {
        const zDistance: number = RenderingEngine.distanceFromPointToPlane(coordinate, xyPlane);

        return {
          x: display.focalLength * RenderingEngine.distanceFromPointToPlane(coordinate, yzPlane) / zDistance,
          y: display.focalLength * RenderingEngine.distanceFromPointToPlane(coordinate, xzPlane) / zDistance
        };
      });

      return {
        coordinates: coordinates2D,
      };
    });
  }
}
