import {
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  FormGroup,
} from '@angular/forms';

export const requireOne = (
  controlName1: string,
  controlName2: string,
): ValidatorFn => {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const group = formGroup as FormGroup;
    const control1 = group.controls[controlName1];
    const control2 = group.controls[controlName2];

    return control1.value || control2.value ? null : { requireOne: true };
  };
};

export const requireXpathIfJsonInput: ValidatorFn = (
  formGroup: AbstractControl,
): ValidationErrors | null => {
  const group = formGroup as FormGroup;
  const jsonInput = group.controls['jsonInput'];
  const xpath = group.controls['xpath'];

  return jsonInput.value && !xpath.value ? { requireXpath: true } : null;
};
