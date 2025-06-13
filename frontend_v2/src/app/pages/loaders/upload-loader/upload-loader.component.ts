import {Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, SimpleChanges, ViewChild} from '@angular/core';
import {ButtonDirective} from '@app/domains/ui/directives/button/button.directive';
import {Router} from '@angular/router';
import {WebsocketService} from '@app/services/websocket.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-upload-loader',
  imports: [
    ButtonDirective
  ],
  templateUrl: './upload-loader.component.html',
  styleUrl: './upload-loader.component.scss'
})
export class UploadLoaderComponent implements OnInit, OnDestroy {

  @ViewChild('progressCircle', {static: true}) progressCircle!: ElementRef;

  public progress: number = 0;
  public message: string = 'Uploading...';
  private circumference = 0;

  private subscription: Subscription = new Subscription();

  constructor(
    private renderer: Renderer2,
    private readonly router: Router,
    private readonly websocketService: WebsocketService,
  ) {}

  ngOnInit() {
    const circle = this.progressCircle.nativeElement;
    const radius = circle.r.baseVal.value; // Now 120
    this.circumference = 2 * Math.PI * radius;

    this.renderer.setStyle(circle, 'strokeDasharray', `${this.circumference}`);
    this.updateProgress(this.progress);

    this.websocketService.connect()
    this.subscription.add(
      this.websocketService.getConnectionStatus().subscribe(status => {
        if (status === 'connected') {
          this.websocketService.sendMessage({
            type: 'start'
          })
        } else if (status === 'disconnected') {
          console.log('WebSocket disconnected');
        } else if (status === 'error') {
          console.error('WebSocket error occurred');
        }
      })
    )
    this.subscription.add(
      this.websocketService.getMessages().subscribe(message => {
        if (message.type === 'complete') {
          this.updateProgress(100);
          this.message = message.message;

          setTimeout(() => {
            this.router.navigate(['/pruning-adjustments']);
          }, 1000);
        } else if (message.type === 'loading') {
          this.updateProgress(message.progress);
          this.message = message.message;
        }
      })
    );

    // this.simulateProgress();
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
