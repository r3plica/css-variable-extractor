import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as postcss from 'postcss';

import { CssVariable } from '@models';

@Injectable()
export class CssVariableExtractorService {
  public convertToCssVariables(
    css: string,
    mergeDuplicates: boolean,
  ): CssVariable[] {
    const root = postcss.parse(css);
    const variables: CssVariable[] = [];
    const valueToVarName: { [key: string]: string } = {};

    root.walkDecls((decl) => {
      const { prop, value, parent } = decl;
      if (parent?.type === 'rule' && this._isValidCssValue(value)) {
        let varName: string;
        if (mergeDuplicates && valueToVarName[value]) {
          varName = valueToVarName[value];
        } else {
          const rule = parent as postcss.Rule;
          varName = this._generateVariableName(rule.selector, prop);
          if (varName.startsWith('---')) varName = varName.slice(1);
          valueToVarName[value] = varName;
          variables.push({ name: varName, value });
        }
        decl.value = `var(${varName})`;
      }
    });

    // Sort variables by value
    variables.sort(
      (a, b) => this._getSortValue(a.value) - this._getSortValue(b.value),
    );

    return mergeDuplicates ? this._removeDuplicateValues(variables) : variables;
  }

  public handleCheckboxes(cssForm: FormGroup | undefined): void {
    const mergeDuplicatesControl = cssForm?.get('mergeDuplicates');
    const overrideVariableNamesControl = cssForm?.get('overrideVariableNames');

    if (!cssForm || !mergeDuplicatesControl || !overrideVariableNamesControl)
      return;

    mergeDuplicatesControl.valueChanges.subscribe((value) => {
      if (value) {
        // Set overrideVariableNames value to false without emitting an event
        overrideVariableNamesControl.setValue(false, { emitEvent: false });
        overrideVariableNamesControl.disable();
      } else {
        overrideVariableNamesControl.enable();
      }
    });

    overrideVariableNamesControl.valueChanges.subscribe((value) => {
      if (value) {
        // Set mergeDuplicates value to false without emitting an event
        mergeDuplicatesControl.setValue(false, { emitEvent: false });
        mergeDuplicatesControl.disable();
      } else {
        mergeDuplicatesControl.enable();
      }
    });
  }

  private _isValidCssValue(value: string): boolean {
    // Simplified valid value check (hex, rgb, simple words like 'red')
    return (
      /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) || /^[a-z]+$/i.test(value)
    );
  }

  private _generateVariableName(selector: string, prop: string): string {
    return `--${this._sanitizeString(selector)}-${this._sanitizeString(prop)}`;
  }

  private _sanitizeString(str: string): string {
    return str.replace(/[\W]+/g, '-').replace(/^--+/, '--');
  }

  private _getSortValue(value: string): number {
    const rgbRegex = /^rgb\((\d+), (\d+), (\d+)\)$/;

    const hexToRgb = (hex: string): number[] => {
      if (hex.length === 4) {
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
      }
      const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
      if (!match) return [0, 0, 0];
      return match.slice(1, 4).map((x) => parseInt(x, 16));
    };

    const rgbToValue = (r: number, g: number, b: number): number => {
      return r * 256 * 256 + g * 256 + b;
    };

    if (/^#[0-9a-f]{3,6}$/i.test(value)) {
      const [r, g, b] = hexToRgb(value);
      return rgbToValue(r, g, b);
    }

    const match = value.match(rgbRegex);
    if (match) {
      const [, r, g, b] = match.map(Number);
      return rgbToValue(r, g, b);
    }

    return 0;
  }

  private _removeDuplicateValues(variables: CssVariable[]): CssVariable[] {
    const seenValues = new Set<string>();
    return variables.filter((variable) => {
      const normalizedValue = variable.value.trim().toLowerCase();
      if (seenValues.has(normalizedValue)) return false;
      seenValues.add(normalizedValue);
      return true;
    });
  }
}
