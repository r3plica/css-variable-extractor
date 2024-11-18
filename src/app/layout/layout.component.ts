import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ComponentStore } from '@ngrx/component-store';
import {
  CssVariableExtractorService,
  CssVariable,
} from './css-variable-extractor.service';

interface LayoutState {
  activeStep: number;
  resultsAvailable: boolean;
  readyForExport: boolean;
  extractedVariables: CssVariable[];
  customVariables: CssVariable[];
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  providers: [ComponentStore],
})
export class LayoutComponent extends ComponentStore<LayoutState> {
  private _fb = inject(FormBuilder);
  private _cssVariableExtractorService = inject(CssVariableExtractorService);

  public cssForm: FormGroup;
  public exportForm!: FormGroup;

  constructor() {
    super({
      activeStep: 0,
      resultsAvailable: false,
      readyForExport: false,
      extractedVariables: [],
      customVariables: [],
    });

    this.cssForm = this._fb.group({
      cssInput: [''],
      mergeDuplicates: [true],
    });
  }

  readonly activeStep$ = this.select((state) => state.activeStep);
  readonly resultsAvailable$ = this.select((state) => state.resultsAvailable);
  readonly readyForExport$ = this.select((state) => state.readyForExport);
  readonly extractedVariables$ = this.select(
    (state) => state.extractedVariables
  );
  readonly customVariables$ = this.select((state) => state.customVariables);

  readonly setStep = this.updater((state, step: number) => ({
    ...state,
    activeStep: step,
  }));

  readonly parseCss = this.updater((state) => {
    const cssInput = this.cssForm.get('cssInput')?.value.trim();
    const mergeDuplicates = this.cssForm.get('mergeDuplicates')?.value;
    if (!cssInput) {
      alert('Please enter some CSS before parsing!');
      return state;
    }

    const extractedVariables =
      this._cssVariableExtractorService.convertToCssVariables(
        cssInput,
        mergeDuplicates
      );

    this._initializeExportForm(extractedVariables);

    return {
      ...state,
      readyForExport: true,
      activeStep: 1,
      extractedVariables,
    };
  });

  readonly clearInput = this.updater((state) => {
    this.cssForm.reset();
    return {
      ...state,
      readyForExport: false,
      resultsAvailable: false,
      activeStep: 0,
      extractedVariables: [],
      customVariables: [],
    };
  });

  readonly exportVariables = this.updater((state) => {
    const exportedResults: CssVariable[] = [];

    state.extractedVariables.forEach((variable, index) => {
      const shouldExport = this.exportForm.get(`export-${index}`)?.value;
      if (!shouldExport) return;

      exportedResults.push({
        name: this.exportForm.get(`name-${index}`)?.value,
        value: this.exportForm.get(`value-${index}`)?.value,
      });
    });

    return {
      ...state,
      customVariables: exportedResults,
      resultsAvailable: true,
      activeStep: 2,
    };
  });

  readonly copyToClipboard = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.customVariables$),
      tap(([_, customVariables]) => {
        const jsonString = JSON.stringify(customVariables, null, 2);
        navigator.clipboard.writeText(jsonString).then(
          () => alert('Copied to clipboard!'),
          (err) => alert('Failed to copy: ' + err)
        );
      })
    )
  );

  private _initializeExportForm(extractedVariables: CssVariable[]): void {
    this.exportForm = this._fb.group({});
    extractedVariables.forEach((variable, index) => {
      this.exportForm.addControl(`export-${index}`, new FormControl(true));
      this.exportForm.addControl(
        `name-${index}`,
        new FormControl(variable.name)
      );
      this.exportForm.addControl(
        `value-${index}`,
        new FormControl(variable.value)
      );
    });
  }
}
