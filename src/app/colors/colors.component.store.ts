/* eslint-disable @typescript-eslint/no-unused-vars */
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComponentStore } from '@ngrx/component-store';
import { inject, Injectable } from '@angular/core';
import { withLatestFrom, tap } from 'rxjs/operators';

import { ColorService } from '@services';

interface ColorsState {
  form: FormGroup | undefined;
  activeStep: number;
}

@Injectable()
export class ColorsComponentStore extends ComponentStore<ColorsState> {
  private _fb = inject(FormBuilder);
  private _colorService = inject(ColorService);

  constructor() {
    super({
      form: undefined,
      activeStep: 0,
    });

    this.patchState({
      form: this._fb.group({
        input: ['', Validators.required],
        output: [''],
      }),
    });
  }

  readonly activeStep$ = this.select((state) => state.activeStep);
  readonly form$ = this.select((state) => state.form);

  readonly viewModel$ = this.select(
    this.activeStep$,
    this.form$,
    (activeStep, form) => ({
      activeStep,
      form,
    }),
  );

  readonly setStep = this.updater((state, step: number) => ({
    ...state,
    activeStep: step,
  }));

  readonly parseVariables = this.updater((state) => {
    const inputControl = state.form?.get('input');
    const outputControl = state.form?.get('output');
    if (inputControl && inputControl.valid && outputControl) {
      try {
        const variables = JSON.parse(inputControl.value);
        if (Array.isArray(variables)) {
          const colorScale = this._colorService.generateColorScale(variables);
          const jsonString = JSON.stringify(colorScale, null, 2);
          outputControl.setValue(jsonString);
          return {
            ...state,
            activeStep: 1,
          };
        } else {
          console.error('Variables should be an array');
          return state;
        }
      } catch (error) {
        console.error('Invalid JSON format', error);
        return state;
      }
    } else {
      console.error('Form is invalid');
      return state;
    }
  });

  readonly copyToClipboard = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.form$),
      tap(([_, form]) => {
        const variables = form?.get('output')?.value;
        const jsonString = JSON.stringify(variables, null, 2);
        navigator.clipboard.writeText(jsonString).then(
          () => alert('Copied to clipboard!'),
          (err) => alert('Failed to copy: ' + err),
        );
      }),
    ),
  );

  readonly exportToFile = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.form$),
      tap(([_, form]) => {
        const variables = form?.get('output')?.value;
        const jsonString = JSON.stringify(variables, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `colors.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }),
    ),
  );

  readonly clearInput = this.updater((state) => {
    if (!state.form) return state;

    state.form.reset();
    state.form.markAsUntouched();

    return {
      ...state,
      activeStep: 0,
      extractedVariables: [],
      customVariables: [],
    };
  });
}
