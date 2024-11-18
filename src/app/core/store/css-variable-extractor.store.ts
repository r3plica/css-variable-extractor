import { Injectable, inject } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { ComponentStore } from '@ngrx/component-store';
import { withLatestFrom, tap, startWith } from 'rxjs';
import { JSONPath } from 'jsonpath-plus';

import {
  CssVariable,
  CssVariableExtractorService,
} from './css-variable-extractor.service';

interface LayoutState {
  activeStep: number;
  resultsAvailable: boolean;
  readyForExport: boolean;
  extractedVariables: CssVariable[];
  customVariables: CssVariable[];
  jsonItems: any[];
  currentItemIndex: number;
  cssForm: FormGroup | undefined;
  exportForm: FormGroup | undefined;
  jsonContent: any;
}

@Injectable({
  providedIn: 'root',
})
export class CssVariableStoreService extends ComponentStore<LayoutState> {
  private _fb = inject(FormBuilder);
  private _cssVariableExtractorService = inject(CssVariableExtractorService);

  constructor() {
    super({
      activeStep: 0,
      resultsAvailable: false,
      readyForExport: false,
      extractedVariables: [],
      customVariables: [],
      jsonItems: [],
      currentItemIndex: 0,
      cssForm: undefined,
      exportForm: undefined,
      jsonContent: undefined,
    });

    this.patchState({
      cssForm: this._fb.group({
        cssInput: [''],
        mergeDuplicates: [true],
        xpath: [''],
        fileName: ['custom-variables.json'],
      }),
      exportForm: this._fb.group({}),
    });
  }

  readonly activeStep$ = this.select((state) => state.activeStep);
  readonly resultsAvailable$ = this.select((state) => state.resultsAvailable);
  readonly readyForExport$ = this.select((state) => state.readyForExport);
  readonly extractedVariables$ = this.select(
    (state) => state.extractedVariables
  );
  readonly customVariables$ = this.select((state) => state.customVariables);
  readonly cssForm$ = this.select((state) => state.cssForm);
  readonly exportForm$ = this.select((state) => state.exportForm);
  readonly jsonContent$ = this.select((state) => state.jsonContent);

  readonly viewModel$ = this.select(
    this.activeStep$,
    this.resultsAvailable$,
    this.readyForExport$,
    this.extractedVariables$,
    this.customVariables$,
    this.cssForm$,
    this.exportForm$,
    this.jsonContent$,
    (
      activeStep,
      resultsAvailable,
      readyForExport,
      extractedVariables,
      customVariables,
      cssForm,
      exportForm,
      jsonContent
    ) => ({
      activeStep,
      resultsAvailable,
      readyForExport,
      extractedVariables,
      customVariables,
      cssForm,
      exportForm,
      jsonContent,
    })
  );

  readonly setStep = this.updater((state, step: number) => ({
    ...state,
    activeStep: step,
  }));

  readonly parseCss = this.updater((state) => {
    if (!state.cssForm) return state;

    const xpath = state.cssForm.get('xpath')?.value;
    const cssInput =
      state.cssForm.get('cssInput')?.value.trim() ||
      this._extractJsonItems(state.jsonContent, xpath);
    const mergeDuplicates = state.cssForm.get('mergeDuplicates')?.value;

    if (!cssInput) {
      alert('Please enter some CSS or upload a JSON file before parsing!');
      return state;
    }

    let extractedVariables: CssVariable[] =
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
    if (!state.cssForm) return state;
    state.cssForm.reset();
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

    state.extractedVariables.forEach((_, index) => {
      if (!state.exportForm) return;

      const shouldExport = state.exportForm.get(`export-${index}`)?.value;
      if (!shouldExport) return;

      exportedResults.push({
        name: state.exportForm.get(`name-${index}`)?.value,
        value: state.exportForm.get(`value-${index}`)?.value,
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

  readonly exportToFile = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.customVariables$, this.cssForm$),
      tap(([_, customVariables, cssForm]) => {
        if (!cssForm) return;
        const jsonString = JSON.stringify(customVariables, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cssForm.get('fileName')?.value || 'custom-variables.json';
        a.click();
        window.URL.revokeObjectURL(url);
      })
    )
  );

  readonly handleFileInput = this.effect<Event>((trigger$) =>
    trigger$.pipe(
      tap((event: Event) => {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          const jsonContent = JSON.parse(reader.result as string);
          this.patchState({ jsonContent });
        };
        reader.readAsText(file);
      })
    )
  );

  private _extractJsonItems(jsonContent: any, xpath: string): any[] {
    console.log('jsonContent', jsonContent);
    console.log('xpath', xpath);
    console.log(
      'JSONPath',
      JSONPath({ path: `$..${xpath}`, json: jsonContent })
    );
    return JSONPath({ path: `$..${xpath}`, json: jsonContent });
  }

  private _processNextItem(): void {
    this.updater((state) => {
      if (!state.cssForm || state.currentItemIndex >= state.jsonItems.length)
        return state;

      const cssContent = state.jsonItems[state.currentItemIndex];
      state.cssForm.get('cssInput')?.setValue(cssContent);
      return {
        ...state,
        currentItemIndex: state.currentItemIndex + 1,
      };
    });
  }

  private _initializeExportForm(extractedVariables: CssVariable[]): void {
    this.updater((state) => {
      extractedVariables.forEach((variable, index) => {
        if (!state.exportForm) return;
        state.exportForm.addControl(`export-${index}`, new FormControl(true));
        state.exportForm.addControl(
          `name-${index}`,
          new FormControl(variable.name)
        );
        state.exportForm.addControl(
          `value-${index}`,
          new FormControl(variable.value)
        );
      });

      return state;
    });
  }

  readonly processNextItem = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => {
        this._processNextItem();
      })
    )
  );
}
