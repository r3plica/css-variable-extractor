import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableExtractorStoreService } from '@store';
import {
  JsonViewerComponent,
  OverridesComponent,
  ResultsComponent,
  StepperComponent,
  VariablesComponent,
} from '@components';

@Component({
  templateUrl: './json.component.html',
  styleUrls: ['./json.component.scss'],
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    VariablesComponent,
    ResultsComponent,
    StepperComponent,
    JsonViewerComponent,
    OverridesComponent,
  ],
  providers: [CssVariableExtractorStoreService],
})
export class JsonComponent implements OnInit {
  private _store = inject(CssVariableExtractorStoreService);

  public viewModel$ = this._store.viewModel$;

  public ngOnInit(): void {
    this._store.clearInput();
    this._store.setStep(0);
  }

  public parseCss(): void {
    this._store.parseCss();
  }

  public clearInput(): void {
    this._store.clearInput();
  }

  public handleFileInput(event: Event): void {
    this._store.handleFileInput(event);
  }
}
