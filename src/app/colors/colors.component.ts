import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ColorsComponentStore } from './colors.component.store';

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [ColorsComponentStore],
  templateUrl: './colors.component.html',
  styleUrl: './colors.component.scss',
})
export class ColorsComponent {
  private _store = inject(ColorsComponentStore);

  public viewModel$ = this._store.viewModel$;

  public ngOnInit(): void {
    this._store.clearInput();
    this._store.setStep(0);
  }

  public setStep(step: number): void {
    this._store.setStep(step);
  }

  public parseVariables(): void {
    this._store.parseVariables();
  }

  public copyToClipboard(): void {
    this._store.copyToClipboard();
  }

  public exportToFile(): void {
    this._store.exportToFile();
  }

  public clearInput(): void {
    this._store.clearInput();
  }
}
