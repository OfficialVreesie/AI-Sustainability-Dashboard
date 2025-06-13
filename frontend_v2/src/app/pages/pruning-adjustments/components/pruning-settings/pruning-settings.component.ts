import {Component, Input} from '@angular/core';
import {FormInputSelectComponent} from '@app/domains/ui/components/forms/form-input-select/form-input-select.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UploadService} from '@app/services/upload.service';
import {Router} from '@angular/router';
import {FormInputSliderComponent} from '@app/domains/ui/components/forms/form-input-slider/form-input-slider.component';
import {PruneSettingsFormGroup} from '@app/types/pruning.types';

@Component({
  selector: 'app-pruning-settings',
  imports: [
    FormInputSelectComponent,
    FormInputSliderComponent
  ],
  templateUrl: './pruning-settings.component.html',
  styleUrl: './pruning-settings.component.scss'
})
export class PruningSettingsComponent {

  @Input() formGroup: PruneSettingsFormGroup;
  @Input() gpus: { value: string, label: string }[] = [];
  @Input() locations: { value: string, label: string }[] = [];
  @Input() metrics: { value: string, label: string }[] = [];

  constructor(
    private readonly router: Router,
  ) {
  }

}
