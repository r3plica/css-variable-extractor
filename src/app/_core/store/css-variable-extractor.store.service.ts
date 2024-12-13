import { inject, Injectable } from '@angular/core';
import * as postcss from 'postcss';

import { CssVariable } from '@models';
import { ColorService } from '@services';

@Injectable({ providedIn: 'root' })
export class CssVariableExtractorStoreService {
  private _colorService = inject(ColorService);

  public applyOverrides(
    extractedVariables: CssVariable[],
    overridesString: string,
  ): CssVariable[] {
    const customVariables: CssVariable[] = [];
    const foundOverrides: string[] = [];

    if (overridesString) {
      let overrides: [string, string][];
      try {
        overrides = JSON.parse(overridesString);

        extractedVariables.forEach((variable) => {
          overrides.forEach(([key, value]) => {
            if (key !== variable.name || foundOverrides.includes(value)) return;

            customVariables.push({
              ...variable,
              name: value,
            });
            foundOverrides.push(value);
          });
        });
      } catch {
        console.log('error');
        return [];
      }
    }

    return customVariables;
  }

  public saveJsonToFile(data: string, fileName: string): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileName}.json`;
    anchor.click();

    window.URL.revokeObjectURL(url);
  }

  public convertToCssVariables(
    css: string,
    mergeDuplicates: boolean,
  ): CssVariable[] {
    try {
      const cleanedCss = this._cleanCss(css);
      const rbgToHex = this._colorService.rgbToHex(cleanedCss);
      console.log(rbgToHex);
      const root = postcss.parse(rbgToHex);
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

      return mergeDuplicates
        ? this._removeDuplicateValues(variables)
        : variables;
    } catch (error) {
      console.error('Error in convertToCssVariables:', error);
      return [];
    }
  }

  public updateCss(css: string, variables: CssVariable[]): string {
    const sortedVariables = this.sortVariables(variables);
    const cleanedCss = this._cleanCss(css);
    const rgbToHexCss = this._colorService.rgbToHex(cleanedCss);
    let parsedCss = rgbToHexCss;

    sortedVariables.forEach((variable) => {
      const color = variable.value;
      const regex = new RegExp(color, 'g');

      parsedCss = parsedCss.replace(regex, variable.name);
    });

    return parsedCss;
  }

  private sortVariables(variables: CssVariable[]): CssVariable[] {
    const priorityOrder = [
      'primary',
      'secondary',
      'accent',
      'menu',
      'background',
    ];

    return variables.sort((a, b) => {
      const getKeyword = (name: string) => {
        const match = name.match(/-(primary|secondary|accent|menu|background)/);
        return match ? match[1] : 'other';
      };

      const aKeyword = getKeyword(a.name);
      const bKeyword = getKeyword(b.name);

      const aPriority = priorityOrder.indexOf(aKeyword);
      const bPriority = priorityOrder.indexOf(bKeyword);

      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      }

      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;

      return a.name.localeCompare(b.name);
    });
  }

  private _cleanCss(css: string): string {
    return css
      .replace(/;(?=\s*})/gm, '') // Remove semicolons before closing braces
      .replace(/([^{;]+)(?=\s*})/gm, '$1;') // Add missing semicolons before closing braces
      .replace(/\/\*[\s\S]*?\*\//gm, '') // Remove multi-line comments
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\s{2,}/gm, ' ') // Replace multiple spaces with a single space
      .replace(/\s*([{}:;,])\s*/gm, '$1') // Remove spaces around selectors and properties
      .replace(/\s+/gm, ' ') // Normalize any extra spaces to single spaces
      .replace(/(\\r|\\n)/gm, '') // Remove all newlines and carriage returns
      .replace(/background-color\s*:\s*([^;]+)/gm, (match, color) => {
        return `background-color:${color.toLowerCase()}`;
      })
      .replace(/color\s*:\s*([^;]+)/gm, (match, color) => {
        return `color:${color.toLowerCase()}`;
      })
      .trim(); // Remove leading and trailing spaces
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
    const sanitized = str.replace(/[\W]+/g, '-').replace(/^--+/, '--');
    return sanitized.startsWith('-') ? sanitized.slice(1) : sanitized;
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
