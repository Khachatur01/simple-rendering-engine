import {Polygon as Polygon3D} from "./model/3D/polygon";
import {Polygon as Polygon2D} from "./model/2D/polygon";
import {Vector as Vector3D} from "./model/3D/vector";
import {Vector as Vector2D} from "./model/2D/vector";
import {Coefficients as Coefficients3D} from "./model/3D/coefficients";
import {Coefficients as Coefficients2D} from "./model/2D/coefficients";
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
      horizontalPlaneYAngle: 15,
      horizontalPlaneZAngle: 0,
      width: this.canvas.width,
      height: this.canvas.height,
    }
  }

  public add3DPolygon(polygon3D: Polygon3D): void {
    this.polygons3D.push(polygon3D);

    this.renderScene();
  }

  private renderScene(): void {
    const polygons2D: Polygon2D[] = RenderingEngine.project3DPolygons(this.display, this.polygons3D);
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

  private static distance(point1: Vector3D, point2: Vector3D): number {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) +
      Math.pow(point1.y - point2.y, 2) +
      Math.pow(point1.z - point2.z, 2)
    );
  }

  private static coefficientsOfPlaneThrough3Points(A: Vector3D, B: Vector3D, C: Vector3D): Coefficients3D {
    const BA: Vector3D = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
    const CA: Vector3D = { x: C.x - A.x, y: C.y - A.y, z: C.z - A.z };

    const a: number = BA.y * CA.z - CA.y * BA.z;
    const b: number = CA.x * BA.z - BA.x * CA.z;
    const c: number = BA.x * CA.y - BA.y * CA.z;
    const d: number = -a * A.x - b & A.y - c * A.z;

    return { a, b, c, d };
  }

  private static coefficientsOfPlane(normalVector: Vector3D, { x, y, z }: Vector3D): Coefficients3D {
    const a: number = normalVector.x;
    const b: number = normalVector.y;
    const c: number = normalVector.z;

    return {
      a: a,
      b: b,
      c: c,
      d: a*x + b*y + c*z,
    };
  }

  private static coefficientsOfLineThrough2Points(A: Vector3D, B: Vector3D): Coefficients2D {
    const a: number = A.y - B.y;
    const b: number = B.x - A.x;
    const c: number = A.x * B.y - B.x * A.y;

    return { a, b, c };
  }

  private static distanceFromPointToPlane({x, y, z}: Vector3D, {a, b, c, d}: Coefficients3D): number {
    const numerator: number = Math.abs(a * x + b * y + c * z + d);
    const denominator: number = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2));

    return numerator / denominator;
  }

  private static normalVectorOfPlane(center: Vector3D, yAngle: number, zAngle: number): Vector3D {
    const referencePoint: Vector3D = {
      x: center.x + Math.cos(zAngle) * -Math.cos(yAngle),
      y: center.y + Math.sin(zAngle) * -Math.cos(yAngle),
      z: center.z + Math.sin(yAngle)
    };

    return subtractPoints(referencePoint, center);
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

      const horizontalPlaneNormal: Vector3D = RenderingEngine.normalVectorOfPlane(display.center, display.horizontalPlaneYAngle, display.horizontalPlaneZAngle);
      const verticalPlaneNormal: Vector3D = RenderingEngine.normalVectorOfPlane(display.center, display.horizontalPlaneYAngle, display.horizontalPlaneZAngle + 90);
      
      const horizontalPlane: Coefficient3D = RenderingEngine.coefficientsOfPlane(horizontalPlaneNormal, display.center);
      const verticalPlane: Coefficient3D = RenderingEngine.coefficientsOfPlane(verticalPlaneNormal, display.center);
      
      const coordinates2D: Vector2D[] = polygon3D.coordinates.map((coordinate: Vector3D): Vector2D => {
        return {
          x: RenderingEngine.distanceFromPointToPlane(coordinate, horizontalPlane),
          y: RenderingEngine.distanceFromPointToPlane(coordinate, verticalPlane)
        };
      });

      return {
        coordinates: coordinates2D,
      };
    });
  }
}
