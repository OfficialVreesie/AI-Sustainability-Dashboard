import { Component } from '@angular/core';
import {AbstractControl, FormBuilder, FormsModule, ValidationErrors, Validators} from '@angular/forms';
import {FormInputTextComponent} from '@app/domains/ui/components/forms/form-input-text/form-input-text.component';
import {FormInputFileComponent} from '@app/domains/ui/components/forms/form-input-file/form-input-file.component';
import {ButtonDirective} from '@app/domains/ui/directives/button/button.directive';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {UploadService} from '@app/services/upload.service';

@Component({
  selector: 'app-upload-page',
  imports: [
    FormsModule,
    FormInputTextComponent,
    FormInputFileComponent,
    ButtonDirective,
    NgIf
  ],
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.scss'
})
export class UploadPageComponent {

  private eitherOrValidator(controlNames: string[]): (group: AbstractControl) => ValidationErrors | null {
    return (group: AbstractControl): ValidationErrors | null => {
      const controls = controlNames.map(name => group.get(name));

      // Check if controls are valid
      if (controls.some(control => !control)) {
        return null; // Invalid configuration, should not happen
      }

      // Count how many fields are filled
      const filledCount = controls.filter(control =>
        control?.value !== null &&
        control?.value !== undefined &&
        control?.value !== ''
      ).length;

      // Either none are filled or more than one is filled
      if (filledCount === 0 || filledCount > 1) {
        return { eitherOr: true };
      }

      return null; // Valid - exactly one is filled
    };
  }

  public uploadFormGroup = this.formBuilder.group({
    huggingfaceUrl: this.formBuilder.control<string | null>(null),
    h5Model: this.formBuilder.control<File | null>(null),
    dataset: this.formBuilder.control<string | null>(null, [Validators.required])
  }, {
    validators: [this.eitherOrValidator(['huggingfaceUrl', 'h5Model'])]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly uploadService: UploadService,
  ) {
  }

  public submitForm(): void {
    if (!this.formIsValid) {
      this.uploadFormGroup.markAllAsTouched();
      return;
    }

    this.uploadService.UploadId = 'abcd';
    this.uploadService.HuggingFaceUrl = this.uploadFormGroup.controls.huggingfaceUrl.value
    this.uploadService.H5ModelFilename = this.uploadFormGroup.controls.h5Model.value?.name || null;

    this.router.navigate(["/loading-upload"])
  }

  get formIsValid(): boolean {
    return this.uploadFormGroup.valid;
  }

  get eitherOrError(): boolean {
    return this.uploadFormGroup.hasError('eitherOr') &&
      (this.uploadFormGroup.touched || this.uploadFormGroup.dirty);
  }

  get neitherFieldFilledError(): boolean {
    return this.eitherOrError &&
      !this.uploadFormGroup.controls.huggingfaceUrl.value &&
      !this.uploadFormGroup.controls.h5Model!.value;
  }

  get bothFieldsFilledError(): boolean {
    return this.eitherOrError &&
      this.uploadFormGroup.controls.huggingfaceUrl!.value !== null &&
      this.uploadFormGroup.controls.h5Model!.value !== null;
  }

}
