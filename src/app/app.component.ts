import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {RenderingEngine} from "./lib/rendering-engine";
import {FormsModule} from "@angular/forms";
import {Polygon} from "./lib/model/3D/polygon";
import {Vector} from "./lib/model/2D/vector";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  public width: number = 800;
  public height: number = 800;

  private renderingEngine?: RenderingEngine;

  private dragStartPosition?: Vector;

  @ViewChild("canvasElement")
  public canvasElement?: ElementRef<HTMLCanvasElement>;

  @HostListener('window:keydown', ['$event'])
  public onMove(event: KeyboardEvent): void {
    const step: number = 10;
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

  @HostListener('window:mousedown', ['$event'])
  public onMouseDown(event: MouseEvent): void {
    this.dragStartPosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  @HostListener('window:mousemove', ['$event'])
  public onMouseMove(event: MouseEvent): void {
    if (!this.dragStartPosition) {
      return;
    }

    const step: number = 0.1;

    this.renderingEngine?.changeCameraAngles(0, (event.clientY - this.dragStartPosition.y) * step, (event.clientX - this.dragStartPosition.x) * step);

    this.dragStartPosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  @HostListener('window:mouseup', ['$event'])
  public onMouseup(): void {
    this.dragStartPosition = undefined;
  }

  @HostListener('window:wheel', ['$event'])
  public onMouseWheel(event: WheelEvent): void {
    const direction: 1 | -1 = event.deltaY >= 0 ? -1 : 1;

    this.renderingEngine?.changeFocalLength(direction * 10);
  }

  public ngAfterViewInit(): void {
    if (this.canvasElement?.nativeElement) {
      this.renderingEngine = new RenderingEngine(this.canvasElement.nativeElement, this.width, this.height);

      this.renderingEngine.create3DCube({x: 300, y: 0, z: 0}, {x: 100, y: 100, z: 100})
        .forEach((polygon: Polygon): void => {
          this.renderingEngine?.add3DPolygon(polygon);
        });
    }
  }
}
