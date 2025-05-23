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

  public gpus = [
    { value: 'NVIDIA A100', label: 'NVIDIA A100' },
    { value: 'NVIDIA V100', label: 'NVIDIA V100' },
    { value: 'NVIDIA T4', label: 'NVIDIA T4' }
  ];

  public locations = [
    { value: 'france', label: 'France' },
    { value: 'netherlands', label: 'Netherlands' },
    { value: 'germany', label: 'Germany' }
  ];

  public metrics = [
    { value: 'accuracy', label: 'Accuracy' },
    { value: 'f1', label: 'F1' },
    { value: 'precision', label: 'Precision' },
    { value: 'recall', label: 'Recall' }
  ];



  constructor(
    private readonly router: Router,
  ) {
  }

}
