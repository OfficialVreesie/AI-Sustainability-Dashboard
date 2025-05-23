import {Component, Input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-form-input-text',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './form-input-text.component.html',
  styleUrl: './form-input-text.component.scss'
})
export class FormInputTextComponent {

  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() label: string;
  @Input() placeholder: string;
  @Input() control: FormControl;
  @Input() required: boolean = false;

}
