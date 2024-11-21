import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableStoreService } from '@store';

@Component({
  selector: 'app-variables',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './variables.component.html',
  styleUrl: './variables.component.scss',
})
export class VariablesComponent {
  private _store = inject(CssVariableStoreService);

  public viewModel$ = this._store.viewModel$;

  public exportVariables(): void {
    this._store.exportVariables();
  }
}
