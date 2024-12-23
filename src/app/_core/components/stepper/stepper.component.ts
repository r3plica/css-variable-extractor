import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { CssVariableExtractorStore } from '@store';

@Component({
  selector: 'app-stepper',
  standalone: true,

  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})
export class StepperComponent {
  private _store = inject(CssVariableExtractorStore);

  public viewModel$ = this._store.viewModel$;

  public setStep(step: number): void {
    this._store.setStep(step);
  }
}
