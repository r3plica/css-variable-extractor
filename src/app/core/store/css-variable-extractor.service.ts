import { Injectable } from '@angular/core';

import * as postcss from 'postcss';

export interface CssVariable {
  name: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class CssVariableExtractorService {
  convertToCssVariables(css: string, mergeDuplicates: boolean): CssVariable[] {
    const root = postcss.parse(css);
    const variables: CssVariable[] = [];

    root.walkDecls((decl) => {
      const { prop, value, parent } = decl;
      if (
        !parent ||
        parent.type !== 'rule' ||
        (!value.startsWith('#') && !/^[a-z]+$/i.test(value))
      )
        return;

      const rule = parent as postcss.Rule;
      const varName = `--${rule.selector.replace(/[\W]+/g, '-')}-${prop.replace(
        /[\W]+/g,
        '-'
      )}`;
      variables.push({ name: varName, value });
      decl.value = `var(${varName})`;
    });

    variables.sort(
      (a, b) => this._getSortValue(a.value) - this._getSortValue(b.value)
    );

    if (!mergeDuplicates) return variables;

    return this._removeDuplicateValues(variables);
  }

  private _getSortValue(value: string): number {
    const hexOrRgbRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    const rgbRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i;

    const hexToRgb = (hex: string): string => {
      let r = 0,
        g = 0,
        b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
      }
      return `rgb(${r}, ${g}, ${b})`;
    };

    const rgbToValue = (rgb: string): number => {
      const match = rgb.match(rgbRegex);
      if (!match) return 0;
      const [, r, g, b] = match.map(Number);
      return r * 256 * 256 + g * 256 + b;
    };

    return hexOrRgbRegex.test(value)
      ? rgbToValue(hexToRgb(value))
      : rgbToValue(value);
  }

  private _removeDuplicateValues(variables: CssVariable[]): CssVariable[] {
    const uniqueVariables: CssVariable[] = [];
    const seenValues = new Set<string>();

    for (const variable of variables) {
      if (seenValues.has(variable.value)) continue;
      seenValues.add(variable.value);
      uniqueVariables.push(variable);
    }

    return uniqueVariables;
  }
}
