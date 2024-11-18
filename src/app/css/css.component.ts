import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableStoreService } from '@store/css-variable-extractor.store';

@Component({
  templateUrl: './css.component.html',
  styleUrls: ['./css.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class CssComponent {
  private _store = inject(CssVariableStoreService);

  public viewModel$ = this._store.viewModel$;

  public setStep(step: number): void {
    this._store.setStep(step);
  }

  public parseCss(): void {
    this._store.parseCss();
  }

  public clearInput(): void {
    this._store.clearInput();
  }

  public exportVariables(): void {
    this._store.exportVariables();
  }

  public copyToClipboard(): void {
    this._store.copyToClipboard();
  }

  public exportToFile(): void {
    this._store.exportToFile();
  }
}
