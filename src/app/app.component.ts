import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {RenderingEngine} from "./lib/rendering-engine";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  private renderingEngine?: RenderingEngine;

  @ViewChild("canvasElement")
  public canvasElement?: ElementRef<HTMLCanvasElement>;

  public ngAfterViewInit(): void {
    if (this.canvasElement?.nativeElement) {
      this.renderingEngine = new RenderingEngine(this.canvasElement.nativeElement);

      // this.renderingEngine.add3DPolygon({
      //   coordinates: [
      //     {x: -200, y: -200, z: 100},
      //     {x: 0, y: 200, z: 100},
      //     {x: 200, y: -200, z: 100},
      //   ]
      // });

      // this.renderingEngine.add3DPolygon({
      //   coordinates: [
      //     {x: -200, y: -200, z: 100},
      //     {x: -200, y: 200, z: 100},
      //     {x: 200, y: 200, z: 100},
      //     {x: 200, y: -200, z: 100},
      //   ]
      // });

      this.renderingEngine.add3DPolygon({
        coordinates: [
          {x: -200, y: -200, z: 100}, /* bottom left */
          {x: -200, y: 200, z: 100}, /* top left */
          {x: 200, y: 200, z: 100}, /* top right */
          {x: 200, y: -200, z: 100}, /* bottom right */
        ]
      });

      this.renderingEngine.add3DPolygon({
        coordinates: [
          {x: -200, y: -200, z: 200}, /* bottom left */
          {x: -200, y: 200, z: 200}, /* top left */
          {x: 200, y: 200, z: 200}, /* top right */
          {x: 200, y: -200, z: 200}, /* bottom right */
        ]
      });

      this.renderingEngine.add3DPolygon({
        coordinates: [
          {x: -200, y: -200, z: 100},
          {x: -200, y: -200, z: 200},
          {x: -200, y: 200, z: 200},
          {x: -200, y: 200, z: 100},
        ]
      });

      this.renderingEngine.add3DPolygon({
        coordinates: [
          {x: -200, y: 200, z: 100},
          {x: 200, y: 200, z: 100},
          {x: 200, y: 200, z: 200},
          {x: -200, y: 200, z: 200},
        ]
      });

      this.renderingEngine.add3DPolygon({
        coordinates: [
          {x: 200, y: 200, z: 200},
          {x: 200, y: 200, z: 100},
          {x: 200, y: -200, z: 100},
          {x: 200, y: -200, z: 200},
        ]
      });
    }
  }
}
