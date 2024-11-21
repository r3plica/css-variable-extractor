import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableStoreService } from '@store';

@Component({
  selector: 'app-overrides',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './overrides.component.html',
  styleUrl: './overrides.component.scss',
})
export class OverridesComponent {
  private _store = inject(CssVariableStoreService);

  public viewModel$ = this._store.viewModel$;

  public applyOverrides(): void {
    this._store.applyOverrides();
  }
}
