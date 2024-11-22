/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ComponentStore } from '@ngrx/component-store';
import { withLatestFrom, tap, from } from 'rxjs';
import { JSONPath } from 'jsonpath-plus';

import { CssVariable } from '@models';

import { CssVariableExtractorService } from './css-variable-extractor.service';

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

@Injectable()
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
          overrides: [''],
          mergeDuplicates: [false],
          existingStructure: [false],
          overrideVariableNames: [false],
          addShades: [false],
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

    // this._cssVariableExtractorService.handleCheckboxes(this.get().cssForm);
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
    const { cssForm, activeStep, currentItemIndex } = state;
    if (!cssForm) return state;

    const xpath = cssForm.get('xpath')?.value;
    const cssInput = cssForm.get('cssInput')?.value;
    const jsonInput = cssForm.get('jsonInput')?.value;
    const mergeDuplicates = cssForm.get('mergeDuplicates')?.value;

    cssForm.markAllAsTouched();

    if (!cssForm.valid) {
      return {
        ...state,
        errors: {
          ...state.errors,
          [activeStep]: 'Please fix the errors before continuing',
        },
        cssForm,
      };
    }

    const extractedVariables =
      this._cssVariableExtractorService.convertToCssVariables(
        cssInput || this._extractJsonItems(jsonInput, xpath, currentItemIndex),
        mergeDuplicates,
      );

    const exportForm = new FormGroup({});
    extractedVariables.forEach((variable, index) => {
      exportForm.addControl(`export-${index}`, new FormControl(true));
      exportForm.addControl(`name-${index}`, new FormControl(variable.name));
      exportForm.addControl(`value-${index}`, new FormControl(variable.value));
    });

    return {
      ...state,
      errors: {},
      exportForm,
      activeStep: 1,
      extractedVariables,
    };
  });

  readonly clearInput = this.updater((state) => {
    const { cssForm } = state;
    if (!cssForm) return state;

    cssForm.reset();
    cssForm.markAsUntouched();

    return {
      ...state,
      activeStep: 0,
      extractedVariables: [],
      customVariables: [],
    };
  });

  readonly exportVariables = this.updater((state) => {
    const exportedResults = state.extractedVariables
      .filter((_, index) => state.exportForm?.get(`export-${index}`)?.value)
      .map((_, index) => ({
        name: state.exportForm?.get(`name-${index}`)?.value,
        value: state.exportForm?.get(`value-${index}`)?.value,
      }));

    return {
      ...state,
      customVariables: exportedResults,
      activeStep: 2,
    };
  });

  readonly applyOverrides = this.updater((state) => {
    const overridesControl = state.cssForm?.get('overrides');
    if (!overridesControl || !overridesControl.value)
      return { ...state, activeStep: 3 };

    let overrides: Map<string, string>;
    try {
      overrides = new Map(JSON.parse(overridesControl.value));
      if (!overrides.size) return { ...state, activeStep: 3 };
    } catch (error) {
      console.error('Failed to parse overrides:', error);
      return state;
    }

    const customVariables = state.customVariables
      .filter((variable) => overrides.has(variable.name))
      .map((variable) => ({
        ...variable,
        name: overrides.get(variable.name) || variable.name,
      }));

    return {
      ...state,
      customVariables,
      activeStep: 3,
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
        const keepStructure = cssForm.get('existingStructure')?.value;

        let jsonString = JSON.stringify(customVariables, null, 2);

        if (keepStructure) {
          const existing = jsonContent[currentItemIndex] || {};
          existing['custom-variables'] = customVariables;
          if (existing[cssForm.get('xpath')?.value])
            delete existing[cssForm.get('xpath')?.value];
          jsonString = JSON.stringify(existing, null, 2);
        }

        const fileName =
          this._extractJsonItems(jsonContent, 'NAME', currentItemIndex) ||
          'custom-variables';
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
                let jsonContent = JSON.parse(fileContent);
                if (!Array.isArray(jsonContent)) {
                  jsonContent = [jsonContent];
                }
                this.patchState((state) => {
                  state.cssForm?.get('jsonInput')?.setValue(jsonContent);
                  const jsonItemCount = jsonContent.length;
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

      state.cssForm.markAsUntouched();

      return {
        ...state,
        currentItemIndex: state.currentItemIndex + 1,
        activeStep: 0,
      };
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
}
