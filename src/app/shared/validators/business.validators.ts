import { Validators, ValidatorFn } from '@angular/forms';

export const businessValidators = {
  subject: [
    Validators.required,
    Validators.maxLength(150),
    Validators.pattern(/^[^\n]*$/)
  ],
  
  fromDisplayName: [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(50)
  ]
};
