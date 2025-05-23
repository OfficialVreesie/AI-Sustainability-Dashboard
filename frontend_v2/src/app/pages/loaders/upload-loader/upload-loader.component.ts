import {Component, ElementRef, Input, OnInit, Renderer2, SimpleChanges, ViewChild} from '@angular/core';
import {ButtonDirective} from '@app/domains/ui/directives/button/button.directive';
import {Router} from '@angular/router';

@Component({
  selector: 'app-upload-loader',
  imports: [
    ButtonDirective
  ],
  templateUrl: './upload-loader.component.html',
  styleUrl: './upload-loader.component.scss'
})
export class UploadLoaderComponent implements OnInit {

  @ViewChild('progressCircle', {static: true}) progressCircle!: ElementRef;

  public progress: number = 0;
  private circumference = 0;

  constructor(
    private renderer: Renderer2,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    const circle = this.progressCircle.nativeElement;
    const radius = circle.r.baseVal.value; // Now 120
    this.circumference = 2 * Math.PI * radius;

    this.renderer.setStyle(circle, 'strokeDasharray', `${this.circumference}`);
    this.updateProgress(this.progress);
    this.simulateProgress();
  }

  simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
        this.router.navigate(['/pruning-adjustments']);
      } else {
        progress += 30;
        this.updateProgress(progress);
      }
    }, 300);
  }

  updateProgress(percent: number): void {
    if (this.progressCircle) {
      percent = Math.min(percent, 100);
      const offset = this.circumference - (percent / 100) * this.circumference;
      this.renderer.setStyle(this.progressCircle.nativeElement, 'strokeDashoffset', `${offset}`);
    }
  }

  onCancel(): void {
    this.router.navigate(["/upload"])
  }

}
