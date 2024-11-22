import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableExtractorStore } from '@store';
import {
  ResultsComponent,
  StepperComponent,
  VariablesComponent,
} from '@components';

@Component({
  templateUrl: './css.component.html',
  styleUrls: ['./css.component.scss'],
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    VariablesComponent,
    ResultsComponent,
    StepperComponent,
  ],
  providers: [CssVariableExtractorStore],
})
export class CssComponent implements OnInit {
  private _store = inject(CssVariableExtractorStore);

  public viewModel$ = this._store.viewModel$;

  public ngOnInit(): void {
    this._store.clearInput();
    this._store.setStep(0);
  }

  public setStep(step: number): void {
    this._store.setStep(step);
  }

  public parseCss(): void {
    this._store.parseCss();
  }

  public clearInput(): void {
    this._store.clearInput();
  }
}
