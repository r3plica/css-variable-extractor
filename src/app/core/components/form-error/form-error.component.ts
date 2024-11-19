import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class FormErrorComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) controlName!: string;
  @Input() errorMessage?: string;

  get control(): AbstractControl | null {
    return this.form?.get(this.controlName) || null;
  }
}
