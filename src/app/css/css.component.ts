import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableStoreService } from '@store/css-variable-extractor.store';
import {
  ResultsComponent,
  StepperComponent,
  VariablesComponent,
} from '@components/index';

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
})
export class CssComponent implements OnInit {
  private _store = inject(CssVariableStoreService);

  public viewModel$ = this._store.viewModel$;

  public ngOnInit(): void {
    this._store.clearInput();
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
