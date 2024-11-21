import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { CssVariableStoreService } from '@store';

import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-stepper',
  standalone: true,

  imports: [CommonModule, ProgressBarComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})
export class StepperComponent {
  private _store = inject(CssVariableStoreService);

  public viewModel$ = this._store.viewModel$;

  public setStep(step: number): void {
    this._store.setStep(step);
  }
}
