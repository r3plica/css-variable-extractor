import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableExtractorStoreService } from '@store';

@Component({
  selector: 'app-variables',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './variables.component.html',
  styleUrl: './variables.component.scss',
})
export class VariablesComponent {
  private _store = inject(CssVariableExtractorStoreService);

  public viewModel$ = this._store.viewModel$;

  public exportVariables(): void {
    this._store.exportVariables();
  }
}
