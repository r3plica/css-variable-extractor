import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableExtractorStore } from '@store';

@Component({
  selector: 'app-variables',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './variables.component.html',
  styleUrl: './variables.component.scss',
})
export class VariablesComponent {
  private _store = inject(CssVariableExtractorStore);

  public viewModel$ = this._store.viewModel$;

  public exportVariables(): void {
    this._store.exportVariables();
  }
}
