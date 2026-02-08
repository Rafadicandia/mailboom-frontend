import { Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export const businessValidators = {
  subject: [
    Validators.required,
    Validators.maxLength(150),
    Validators.pattern(/^[^\n]*$/), // No saltos de línea
    noConsecutiveUppercase(3)
  ],
  
  fromDisplayName: [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(50)
  ]
};

function noConsecutiveUppercase(maxConsecutive: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;
    
    const consecutiveUppercase = /[A-Z]{4,}/;
    if (consecutiveUppercase.test(value)) {
      return { 
        consecutiveUppercase: { 
          maxAllowed: maxConsecutive
        } 
      };
    }
    return null;
  };
}