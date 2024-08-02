import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {RenderingEngine} from "./lib/rendering-engine";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  public xAngle: number = 0;
  public yAngle: number = 0;
  public zAngle: number = 0;
  public focalLength: number = 0;

  private renderingEngine?: RenderingEngine;

  @ViewChild("canvasElement")
  public canvasElement?: ElementRef<HTMLCanvasElement>;

  @HostListener('window:keydown', ['$event'])
  public onMove(event: KeyboardEvent): void {
    const step: number = 20;
    switch (event.key) {
      case "w":
        this.renderingEngine?.moveCamera({x: -step, y: 0, z: 0})
        break;
      case "s":
        this.renderingEngine?.moveCamera({x: step, y: 0, z: 0})
        break;
      case "a":
        this.renderingEngine?.moveCamera({x: 0, y: -step, z: 0})
        break;
      case "d":
        this.renderingEngine?.moveCamera({x: 0, y: step, z: 0})
        break;
      case "ArrowUp":
        this.renderingEngine?.moveCamera({x: 0, y: 0, z: step})
        break;
      case "ArrowDown":
        this.renderingEngine?.moveCamera({x: 0, y: 0, z: -step})
        break;
    }
  }

  public ngAfterViewInit(): void {
    if (this.canvasElement?.nativeElement) {
      this.renderingEngine = new RenderingEngine(this.canvasElement.nativeElement);

      this.renderingEngine.add3DPolygon({
        coordinates: [
          {x: 100, z: -200, y: -200}, /* bottom left */
          {x: 100, y: -200, z: 200}, /* top left */
          {x: 100, y: 200, z: 200}, /* top right */
          {x: 100, y: 200, z: -200}, /* bottom right */
        ]
      });

      this.renderingEngine.add3DPolygon({
        coordinates: [
          {x: 200, y: -200, z: -200}, /* bottom left */
          {x: 200, y: -200, z: 200}, /* top left */
          {x: 200, y: 200, z: 200}, /* top right */
          {x: 200, y: 200, z: -200}, /* bottom right */
        ]
      });

      this.renderingEngine.add3DPolygon({
        coordinates: [
          {x: 100, y: -200, z: -200},
          {x: 200, y: -200, z: -200},
          {x: 200, y: -200, z: 200},
          {x: 100, y: -200, z: 200},
        ]
      });

      this.renderingEngine.add3DPolygon({
        coordinates: [
          {x: 100, y: -200, z: 200},
          {x: 100, y: 200, z: 200},
          {x: 200, y: 200, z: 200},
          {x: 200, y: -200, z: 200},
        ]
      });

      this.renderingEngine.add3DPolygon({
        coordinates: [
          {x: 200, y: 200, z: 200},
          {x: 100, y: 200, z: 200},
          {x: 100, y: 200, z: -200},
          {x: 200, y: 200, z: -200},
        ]
      });
    }
  }

  public onAngleChange(): void {
    this.renderingEngine?.setCameraAngles(this.xAngle, this.yAngle, this.zAngle);
  }

  public onFocalLengthChange(): void {
    this.renderingEngine?.setFocalLength(this.focalLength);
  }
}
