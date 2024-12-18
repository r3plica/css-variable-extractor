import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CssVariableExtractorStore } from '@store';

@Component({
  selector: 'app-defaults',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './defaults.component.html',
  styleUrl: './defaults.component.scss',
})
export class DefaultsComponent {
  private _store = inject(CssVariableExtractorStore);

  public viewModel$ = this._store.viewModel$;

  public getControlIndexes(form: FormGroup): number[] {
    return Array.from(
      new Set(
        Object.keys(form.controls)
          .filter((key) => key.includes('-'))
          .map((key) => parseInt(key.split('-')[1], 10)),
      ),
    ).sort((a, b) => a - b);
  }

  public applyDefaults(): void {
    this._store.applyDefaults();
  }
}
