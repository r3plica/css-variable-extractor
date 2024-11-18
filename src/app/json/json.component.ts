import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CssVariableStoreService } from '@store/css-variable-extractor.store';
import { FormErrorComponent } from '@components/index';

import { VariablesComponent } from '../core/components/variables/variables.component';
import { ResultsComponent } from '../core/components/results/results.component';
import { StepperComponent } from '../core/components/stepper/stepper.component';
import { JsonViewerComponent } from '../core/components/json-viewer/json-viewer.component';

@Component({
  templateUrl: './json.component.html',
  styleUrls: ['./json.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormErrorComponent,
    VariablesComponent,
    ResultsComponent,
    StepperComponent,
    JsonViewerComponent,
  ],
})
export class JsonComponent implements OnInit {
  private _store = inject(CssVariableStoreService);

  public viewModel$ = this._store.viewModel$;

  public ngOnInit(): void {
    this._store.clearInput();
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
