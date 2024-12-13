import { Injectable } from '@angular/core';
import chroma, { scale } from 'chroma-js';

import { CssVariable } from '@models';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  public generateColorScale(variables: CssVariable[]): CssVariable[] {
    const scaledVariables: CssVariable[] = [];
    const existingVariables = new Map(
      variables.map((variable) => [variable.name, variable.value]),
    );

    const baseVariables = this.getBaseVariables(variables);

    baseVariables.forEach((baseVariable) => {
      const { name, value } = baseVariable;
      if (!this.isValidHex(value)) return;

      this.generateColorIncrements(
        value,
        name,
        scaledVariables,
        existingVariables,
      );
    });

    return scaledVariables;
  }

  public rgbToHex(css: string): string {
    const regex =
      /rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(\d*\.?\d+))?\)/g;

    const updatedCss = css.replace(regex, (match, r, g, b, a) => {
      try {
        const hex = a
          ? chroma(`rgba(${r},${g},${b},${a})`).hex() // rgba to hex
          : chroma(`rgb(${r},${g},${b})`).hex(); // rgb to hex
        return hex;
      } catch (error) {
        console.error(`Error converting color: ${match}`, error);
        return match;
      }
    });

    return updatedCss;
  }

  private isValidHex(hex: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
  }

  private generateColorIncrements(
    hexColor: string,
    name: string,
    colorScale: CssVariable[],
    originalVariables: Map<string, string>,
  ) {
    const scaleColors = scale([
      chroma(hexColor).set('hsl.l', 0.6),
      hexColor,
      chroma(hexColor).set('hsl.l', 0.2),
    ])
      .mode('lab')
      .colors(11);
    const increments = [
      50,
      ...Array.from({ length: 9 }, (_, i) => (i + 1) * 100),
      950,
    ];

    scaleColors.forEach((color, index) => {
      const incrementValue = increments[index];
      const incrementName = `${name}-${incrementValue}`;

      if (originalVariables.has(incrementName)) {
        colorScale.push({
          name: incrementName,
          value: originalVariables.get(incrementName)!,
        });
      } else {
        colorScale.push({
          name: incrementName,
          value: color,
        });
        originalVariables.set(incrementName, color);
      }
    });

    const matchVariable = colorScale.find((v) => v.name === name);
    const originalVariable = originalVariables.has(name);

    if (matchVariable || !originalVariable) return;

    colorScale.push({
      name,
      value: originalVariables.get(name)!,
    });
  }

  private getBaseVariables(variables: CssVariable[]): CssVariable[] {
    const increments = Array.from({ length: 19 }, (_, i) => (i + 1) * 50);

    return variables.filter((variable) => {
      const match = variable.name.match(/-(\d+)$/);
      if (!match) return true;

      const incrementValue = parseInt(match[1], 10);
      return !increments.includes(incrementValue);
    });
  }
}
