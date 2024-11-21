import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CssVariableStoreService } from '@store';
import {
  FormErrorComponent,
  JsonViewerComponent,
  ResultsComponent,
  StepperComponent,
  VariablesComponent,
} from '@components';

@Component({
  templateUrl: './json.component.html',
  styleUrls: ['./json.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
