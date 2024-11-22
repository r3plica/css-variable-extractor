import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableExtractorStore } from '@store';

import { ExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';

@Component({
  selector: 'app-results',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule, ExpansionPanelComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent {
  private _store = inject(CssVariableExtractorStore);

  public viewModel$ = this._store.viewModel$;

  public copyToClipboard(): void {
    this._store.copyToClipboard();
  }

  public exportToFile(): void {
    this._store.exportToFile();
  }

  public processNextItem(): void {
    this._store.processNextItem();
  }
}
