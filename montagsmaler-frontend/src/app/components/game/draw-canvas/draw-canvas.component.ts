import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';

@Component({
  selector: "app-draw-canvas",
  templateUrl: "./draw-canvas.component.html",
  styleUrls: ["./draw-canvas.component.scss"],
})
export class DrawCanvasComponent implements AfterViewInit {
  @Input() public width = 650;
  @Input() public height = 500;

  @ViewChild("drawCanvas", { static: false }) public canvas: ElementRef;

  private cx: CanvasRenderingContext2D;
  private points = [];
  private lineWidth = 5;
  private strokeStyle = "#000";
  private lineCounter = 0;

  image;

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext("2d");

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = this.lineWidth;
    this.cx.lineCap = "round";
    this.cx.strokeStyle = this.strokeStyle;

    this.captureEvents(canvasEl);
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, "mousedown")
      .pipe(
        switchMap((e) => {
          console.log(this.lineCounter);
          this.lineCounter = this.lineCounter + 1;
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, "mousemove").pipe(
            // we'll stop (and unsubscribe) once the user releases the mouse
            // this will trigger a 'mouseup' event
            takeUntil(fromEvent(canvasEl, "mouseup")),
            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
            takeUntil(fromEvent(canvasEl, "mouseleave")),
            // pairwise lets us get the previous value to draw a line from
            // the previous point to the current point
            pairwise()
          );
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        console.log(res);

        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top,
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top,
        };

        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(
    prevPos: { x: number; y: number },
    currentPos: { x: number; y: number }
  ) {
    if (!this.cx) {
      return;
    }

    this.cx.beginPath();
    if (!prevPos) {
      this.points.push({
        x: currentPos.x,
        y: currentPos.y,
        size: this.lineWidth,
        color: this.strokeStyle,
        line: this.lineCounter,
      });
      this.points[this.points.length - 1].mode = "end";
    }

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();

      this.points.push({
        x: currentPos.x,
        y: currentPos.y,
        size: this.lineWidth,
        color: this.strokeStyle,
        line: this.lineCounter,
      });
    }
  }

  undo() {
    const lastPoint = this.points.pop();

    for (let i = this.points.length; i--; ) {
      if (this.points[i].line === lastPoint.line) {
        this.points.splice(i, 1);
      }
    }
    this.lineCounter = this.lineCounter - 1;
    this.redraw();
  }

  private redraw() {
    this.cx.clearRect(0, 0, this.width, this.height);

    if (this.points.length === 0) {
      return;
    }
    let lineCount = 0;

    for (let i = 0; i < this.points.length; i++) {
      console.log(this.points);

      const pt = this.points[i];

      if (lineCount < pt.line && lineCount !== 0) {
        this.cx.stroke();
      }

      if (lineCount < pt.line) {
        this.cx.beginPath();
        this.cx.moveTo(pt.x, pt.y);
        lineCount = pt.line;
      }

      this.cx.lineTo(pt.x, pt.y);
    }
    this.cx.stroke();
  }

  downloadImage() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.image = canvasEl.toDataURL();
  }
}
