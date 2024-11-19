/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ComponentStore } from '@ngrx/component-store';
import { withLatestFrom, tap, from } from 'rxjs';
import { JSONPath } from 'jsonpath-plus';

import {
  CssVariable,
  CssVariableExtractorService,
} from './css-variable-extractor.service';

interface LayoutState {
  activeStep: number;
  extractedVariables: CssVariable[];
  customVariables: CssVariable[];
  jsonItems: any[];
  currentItemIndex: number;
  cssForm: FormGroup | undefined;
  exportForm: FormGroup | undefined;
  jsonItemCount: number;
  errors: { [key: number]: string };
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
      extractedVariables: [],
      customVariables: [],
      jsonItems: [],
      currentItemIndex: 0,
      cssForm: undefined,
      exportForm: undefined,
      jsonItemCount: 0,
      errors: {},
    });

    this.patchState({
      cssForm: this._fb.group(
        {
          cssInput: [''],
          jsonInput: [''],
          mergeDuplicates: [true],
          xpath: [''],
        },
        {
          validators: [
            this._requireOne('cssInput', 'jsonInput'),
            this._requireXpathIfJsonInput(),
          ],
        },
      ),
      exportForm: this._fb.group({}),
    });
  }

  private _requireOne(controlName1: string, controlName2: string) {
    return (formGroup: FormGroup) => {
      const control1 = formGroup.controls[controlName1];
      const control2 = formGroup.controls[controlName2];

      if (control1.value || control2.value) {
        control1.setErrors(null);
        control2.setErrors(null);
      } else {
        control1.setErrors({ required: true });
        control2.setErrors({ required: true });
        this.patchState((state) => ({
          ...state,
          errors: {
            ...state.errors,
            [state.activeStep]: 'One of the inputs is required',
          },
        }));
      }
    };
  }

  private _requireXpathIfJsonInput() {
    return (formGroup: FormGroup) => {
      const jsonInput = formGroup.controls['jsonInput'];
      const xpath = formGroup.controls['xpath'];

      if (jsonInput.value && !xpath.value) {
        xpath.setErrors({ required: true });
        this.patchState((state) => ({
          ...state,
          errors: {
            ...state.errors,
            [state.activeStep]: 'XPath is required when JSON input is provided',
          },
        }));
      } else {
        xpath.setErrors(null);
      }
    };
  }

  readonly activeStep$ = this.select((state) => state.activeStep);
  readonly extractedVariables$ = this.select(
    (state) => state.extractedVariables,
  );
  readonly customVariables$ = this.select((state) => state.customVariables);
  readonly cssForm$ = this.select((state) => state.cssForm);
  readonly exportForm$ = this.select((state) => state.exportForm);
  readonly jsonItemCount$ = this.select((state) => state.jsonItemCount);
  readonly currentItemIndex$ = this.select((state) => state.currentItemIndex);
  readonly errors$ = this.select((state) => state.errors);

  readonly viewModel$ = this.select(
    this.activeStep$,
    this.extractedVariables$,
    this.customVariables$,
    this.cssForm$,
    this.exportForm$,
    this.jsonItemCount$,
    this.currentItemIndex$,
    this.errors$,
    (
      activeStep,
      extractedVariables,
      customVariables,
      cssForm,
      exportForm,
      jsonItemCount,
      currentItemIndex,
      errors,
    ) => ({
      activeStep,
      extractedVariables,
      customVariables,
      cssForm,
      exportForm,
      jsonItemCount,
      currentItemIndex,
      errors,
    }),
  );

  readonly setStep = this.updater((state, step: number) => ({
    ...state,
    activeStep: step,
  }));

  readonly parseCss = this.updater((state) => {
    if (!state.cssForm) return state;

    const xpath = state.cssForm.get('xpath')?.value;
    const cssInput = state.cssForm.get('cssInput')?.value;
    const jsonInput = state.cssForm.get('jsonInput')?.value;
    const mergeDuplicates = state.cssForm.get('mergeDuplicates')?.value;

    const cssForm = state.cssForm;
    const errors: { [key: number]: string } = {};

    cssForm.markAllAsTouched();

    if (!cssForm.valid) {
      errors[state.activeStep] = 'Please fix the errors before continuing';
    }

    if (errors[state.activeStep])
      return {
        ...state,
        errors,
        cssForm,
      };

    const extractedVariables: CssVariable[] =
      this._cssVariableExtractorService.convertToCssVariables(
        cssInput ||
          this._extractJsonItems(jsonInput, xpath, state.currentItemIndex),
        mergeDuplicates,
      );

    const exportForm = state.exportForm || new FormGroup({});

    extractedVariables.forEach((variable, index) => {
      exportForm.addControl(`export-${index}`, new FormControl(true));
      exportForm.addControl(`name-${index}`, new FormControl(variable.name));
      exportForm.addControl(`value-${index}`, new FormControl(variable.value));
    });

    return {
      ...state,
      errors,
      exportForm,
      activeStep: 1,
      extractedVariables,
    };
  });

  readonly clearInput = this.updater((state) => {
    if (!state.cssForm) return state;

    state.cssForm.reset();
    state.cssForm.markAsUntouched();
    state.cssForm.get('mergeDuplicates')?.setValue(true);

    return {
      ...state,
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
          (err) => alert('Failed to copy: ' + err),
        );
      }),
    ),
  );

  readonly processNextItem = this.effect((trigger$) =>
    trigger$.pipe(
      tap(() => {
        this._processNextItem();
      }),
    ),
  );

  readonly exportToFile = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(
        this.customVariables$,
        this.cssForm$,
        this.currentItemIndex$,
      ),
      tap(([_, customVariables, cssForm, currentItemIndex]) => {
        if (!cssForm) return;
        const jsonContent = cssForm.get('jsonInput')?.value;
        const fileName =
          this._extractJsonItems(jsonContent, 'NAME', currentItemIndex) ||
          'custom-variables';
        const jsonString = JSON.stringify(customVariables, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.processNextItem();
      }),
    ),
  );

  readonly handleFileInput = this.effect<Event>((trigger$) =>
    trigger$.pipe(
      tap((event: Event) => {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];

        const readFileAsText = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
          });
        };

        from(readFileAsText(file))
          .pipe(
            tap((fileContent) => {
              try {
                const jsonContent = JSON.parse(fileContent);
                this.patchState((state) => {
                  state.cssForm?.get('jsonInput')?.setValue(jsonContent);
                  const jsonItemCount = Array.isArray(jsonContent)
                    ? jsonContent.length
                    : 0;
                  return { ...state, jsonItemCount, currentItemIndex: 0 };
                });
              } catch (error) {
                console.error('Failed to parse JSON content:', error);
              }
            }),
          )
          .subscribe();
      }),
    ),
  );

  private _extractJsonItems(
    jsonContent: string,
    xpath: string,
    index: number,
  ): any {
    if (!jsonContent || !xpath) return '';
    const jsonItems = JSONPath({ path: `$..${xpath}`, json: jsonContent });
    return jsonItems[index] || '';
  }

  private _processNextItem(): void {
    this.patchState((state) => {
      if (!state.cssForm || state.currentItemIndex >= state.jsonItemCount) {
        return state;
      }

      const cssContent = this._extractJsonItems(
        state.cssForm.get('jsonInput')?.value,
        state.cssForm.get('xpath')?.value,
        state.currentItemIndex,
      );

      state.cssForm.get('cssInput')?.setValue(cssContent);
      state.cssForm.markAsUntouched();

      return {
        ...state,
        currentItemIndex: state.currentItemIndex + 1,
        activeStep: 0,
      };
    });
  }
}
