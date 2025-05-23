import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appButton]'
})
export class ButtonDirective {

  @Input() primary: boolean = false;
  @Input() secondary: boolean = false;
  @Input() fullWidth: boolean = false;

  @HostBinding('class') get classes() {
    return {
      'button': true,
      'button__primary': this.primary,
      'button__secondary': this.secondary,
      'button__full-width': this.fullWidth,
    };
  }
}
