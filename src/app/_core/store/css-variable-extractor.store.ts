/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ComponentStore } from '@ngrx/component-store';
import { withLatestFrom, tap, from } from 'rxjs';
import { JSONPath } from 'jsonpath-plus';
import { cloneDeep } from 'lodash';

import { CssVariable } from '@models';
import { ColorService } from '@services';

import { CssVariableExtractorStoreService } from './css-variable-extractor.store.service';
import {
  requireOne,
  requireXpathIfJsonInput,
} from './css-variable-validators.const';

export interface ExtractorState {
  activeStep: number;
  extractedVariables: CssVariable[];
  customVariables: CssVariable[];
  jsonItems: any[];
  currentItemIndex: number;
  cssForm: FormGroup | undefined;
  exportForm: FormGroup | undefined;
  defaultsForm: FormGroup | undefined;
  jsonItemCount: number;
  errors: { [key: number]: string };
  overrides: string[] | undefined;
}

@Injectable()
export class CssVariableExtractorStore extends ComponentStore<ExtractorState> {
  private _fb = inject(FormBuilder);
  private _colorService = inject(ColorService);
  private _cssVariableExtractorService = inject(
    CssVariableExtractorStoreService,
  );

  constructor() {
    super({
      activeStep: 0,
      extractedVariables: [],
      customVariables: [],
      jsonItems: [],
      currentItemIndex: 0,
      cssForm: undefined,
      exportForm: undefined,
      defaultsForm: undefined,
      overrides: undefined,
      jsonItemCount: 0,
      errors: {},
    });

    const cssForm = this._fb.group(
      {
        cssInput: [''],
        jsonInput: [''],
        overrides: [''],
        defaults: [''],
        mergeDuplicates: [false],
        existingStructure: [false],
        overrideVariableNames: [false],
        addDefaults: [false],
        addShades: [false],
        xpath: [''],
      },
      {
        validators: [
          requireOne('cssInput', 'jsonInput'),
          requireXpathIfJsonInput,
        ],
      },
    );

    cssForm.statusChanges.subscribe(() => {
      this.handleValidationErrors(cssForm);
    });

    this.patchState({ cssForm });
  }

  readonly activeStep$ = this.select((state) => state.activeStep);
  readonly extractedVariables$ = this.select(
    (state) => state.extractedVariables,
  );
  readonly customVariables$ = this.select((state) => state.customVariables);
  readonly cssForm$ = this.select((state) => state.cssForm);
  readonly exportForm$ = this.select((state) => state.exportForm);
  readonly defaultsForm$ = this.select((state) => state.defaultsForm);
  readonly jsonItemCount$ = this.select((state) => state.jsonItemCount);
  readonly currentItemIndex$ = this.select((state) => state.currentItemIndex);
  readonly errors$ = this.select((state) => state.errors);
  readonly overrides$ = this.select((state) => state.overrides);

  readonly viewModel$ = this.select(
    this.activeStep$,
    this.extractedVariables$,
    this.customVariables$,
    this.cssForm$,
    this.exportForm$,
    this.defaultsForm$,
    this.jsonItemCount$,
    this.currentItemIndex$,
    this.errors$,
    this.overrides$,
    (
      activeStep,
      extractedVariables,
      customVariables,
      cssForm,
      exportForm,
      defaultsForm,
      jsonItemCount,
      currentItemIndex,
      errors,
      overrides,
    ) => ({
      activeStep,
      extractedVariables,
      customVariables,
      cssForm,
      exportForm,
      defaultsForm,
      jsonItemCount,
      currentItemIndex,
      errors,
      overrides,
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

  readonly exportVariables = this.updater((state) => {
    let customVariables = state.extractedVariables
      .filter((_, index) => state.exportForm?.get(`export-${index}`)?.value)
      .map((_, index) => ({
        name: state.exportForm?.get(`name-${index}`)?.value,
        value: state.exportForm?.get(`value-${index}`)?.value,
      }));

    const overrideVariableNames = state.cssForm?.get(
      'overrideVariableNames',
    )?.value;
    const addShades = state.cssForm?.get('addShades')?.value;

    if (!overrideVariableNames && addShades) {
      customVariables = this._colorService.generateColorScale(customVariables);
    }

    return {
      ...state,
      customVariables,
      activeStep: 2,
    };
  });

  readonly applyOverrides = this.updater((state) => {
    const overridesControl = state.cssForm?.get('overrides');
    if (!overridesControl) return { ...state, activeStep: 2 };

    let customVariables = this._cssVariableExtractorService.applyOverrides(
      state.extractedVariables,
      overridesControl.value,
    );

    if (customVariables.length === 0)
      customVariables = state.extractedVariables;

    const value: [string, string][] = JSON.parse(
      overridesControl.value || '[]',
    );
    const overrideNames = new Set(value.map((pair) => pair[1]));
    const overrides = Array.from(overrideNames);

    const addDefaults = state.cssForm?.get('addDefaults')?.value;
    const defaultsForm = addDefaults
      ? this._cssVariableExtractorService.createDefaultsForm(
          value,
          customVariables,
        )
      : undefined;

    const addShades = state.cssForm?.get('addShades')?.value;

    if (addShades && !addDefaults) {
      customVariables = this._colorService.generateColorScale(customVariables);
    }

    return {
      ...state,
      customVariables,
      overrides,
      defaultsForm: defaultsForm ?? state.defaultsForm,
      activeStep: 2,
    };
  });

  readonly applyDefaults = this.updater((state) => {
    const existingVariables = state.customVariables;
    const defaultsForm = state.defaultsForm;
    if (!defaultsForm)
      return {
        ...state,
        activeStep: 3,
      };
    let customVariables = this._cssVariableExtractorService.applyDefaults(
      existingVariables,
      defaultsForm,
    );

    const addShades = state.cssForm?.get('addShades')?.value;
    if (addShades)
      customVariables = this._colorService.generateColorScale(customVariables);

    return {
      ...state,
      customVariables,
      activeStep: 3,
    };
  });

  readonly export = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(
        this.customVariables$,
        this.cssForm$,
        this.defaultsForm$,
        this.currentItemIndex$,
        this.jsonItemCount$,
      ),
      tap(
        ([
          _,
          customVariables,
          cssForm,
          defaultsForm,
          currentItemIndex,
          jsonItemCount,
        ]) => {
          if (!cssForm) return;

          const jsonInput = cloneDeep(cssForm.get('jsonInput')?.value);
          const xpath = cssForm.get('xpath')?.value;
          const keepStructure = cssForm.get('existingStructure')?.value;

          if (jsonItemCount <= 1) {
            const jsonString = this.prepareExportJson(
              customVariables,
              jsonInput,
              currentItemIndex,
              keepStructure,
              xpath,
            );

            const fileName =
              this._extractJsonItems(jsonInput, 'NAME', currentItemIndex) ||
              'custom-variables';

            this._cssVariableExtractorService.saveJsonToFile(
              jsonString,
              fileName,
            );
            return;
          }

          const mergeDuplicates = cssForm.get('mergeDuplicates')?.value;
          const overrideVariableNames = cssForm.get(
            'overrideVariableNames',
          )?.value;
          const addShades = cssForm.get('addShades')?.value;
          const addDefaults = cssForm.get('addDefaults')?.value;

          const allData = [];

          for (let i = currentItemIndex; i < jsonItemCount; i++) {
            // Step 1: Extract variables
            const extractedVariables =
              this._cssVariableExtractorService.convertToCssVariables(
                this._extractJsonItems(jsonInput, xpath, i),
                mergeDuplicates,
              );

            // Step 2: Apply overrides
            const overridesControl = cssForm.get('overrides');
            let customVariables: CssVariable[] = [];
            if (overridesControl && overrideVariableNames) {
              customVariables =
                this._cssVariableExtractorService.applyOverrides(
                  extractedVariables,
                  overridesControl.value,
                );
            }

            if (customVariables.length === 0)
              customVariables = extractedVariables;

            // Step 3: Apply defaults
            console.log(addDefaults, defaultsForm);
            if (addDefaults && defaultsForm) {
              customVariables = this._cssVariableExtractorService.applyDefaults(
                customVariables,
                defaultsForm,
              );
              console.log('customVariables', customVariables);
            }

            // Step 4: Add color scales
            if (addShades) {
              customVariables =
                this._colorService.generateColorScale(customVariables);
            }

            // Step 5: Prepare JSON
            const jsonString = this.prepareExportJson(
              customVariables,
              jsonInput,
              i,
              keepStructure,
              xpath,
            );

            // Collect data
            allData.push(JSON.parse(jsonString));
          }

          // Step 5: Save aggregated data
          const aggregatedData = JSON.stringify(allData, null, 2);
          this._cssVariableExtractorService.saveJsonToFile(
            aggregatedData,
            'all-custom-variables',
          );
        },
      ),
    ),
  );

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

  private _extractJsonItems(
    jsonContent: string,
    xpath: string,
    index: number,
  ): any {
    if (!jsonContent || !xpath) return '';
    const jsonItems = JSONPath({ path: `$..${xpath}`, json: jsonContent });
    return jsonItems[index] || '';
  }

  private handleValidationErrors(form: FormGroup) {
    const errors: { [key: number]: string } = {};
    const formErrors = form.errors;

    if (formErrors?.['requireOne']) {
      errors[this.get().activeStep] =
        'Either CSS Input or JSON Input is required.';
    }
    if (formErrors?.['requireXpath']) {
      errors[this.get().activeStep] =
        'XPath is required when JSON Input is provided.';
    }

    this.patchState({ errors });
  }

  private prepareExportJson(
    customVariables: CssVariable[],
    jsonContent: any,
    currentItemIndex: number,
    keepStructure: boolean,
    xpath: string | null,
  ): string {
    if (!keepStructure) {
      return JSON.stringify(customVariables, null, 2);
    }

    const existing = cloneDeep(jsonContent[currentItemIndex] || {});
    existing['variables'] = customVariables;

    if (xpath && existing[xpath]) {
      delete existing[xpath];
    }

    return JSON.stringify(existing, null, 2);
  }
}
