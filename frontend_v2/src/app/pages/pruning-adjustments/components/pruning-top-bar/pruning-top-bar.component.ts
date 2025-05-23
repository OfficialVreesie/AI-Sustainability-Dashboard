import {Component, Input} from '@angular/core';
import {ButtonDirective} from '@app/domains/ui/directives/button/button.directive';
import {UploadService} from '@app/services/upload.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-pruning-top-bar',
  imports: [
    ButtonDirective
  ],
  templateUrl: './pruning-top-bar.component.html',
  styleUrl: './pruning-top-bar.component.scss'
})
export class PruningTopBarComponent {

  public modelName: string = '';

  constructor(
    private readonly router: Router,
    private readonly uploadService: UploadService,
  ) {
    if (!this.uploadService.modelName) {
      this.router.navigate(['/upload']);
    }

    this.modelName = this.uploadService.modelName!;
  }

}
