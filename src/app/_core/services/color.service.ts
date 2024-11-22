import { Injectable } from '@angular/core';
import chroma, { scale } from 'chroma-js';

import { CssVariable } from '@models';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  public generateColorScale(variables: CssVariable[]): CssVariable[] {
    const colorScale: CssVariable[] = [];
    const existingVariables = new Map(
      variables.map((variable) => [variable.name, variable.value]),
    );

    const baseVariables = this.getBaseVariables(variables);

    baseVariables.forEach((baseVariable) => {
      const { name, value } = baseVariable;
      if (!this.isValidHex(value)) return;

      const readableName = name.replace(/^--/, '');
      this.generateColorIncrements(
        value,
        readableName,
        colorScale,
        existingVariables,
      );
    });

    return colorScale;
  }

  private isValidHex(hex: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
  }

  private generateColorIncrements(
    hexColor: string,
    readableName: string,
    colorScale: CssVariable[],
    existingVariables: Map<string, string>,
  ) {
    const scaleColors = scale([
      chroma(hexColor).set('hsl.l', 0.6),
      hexColor,
      chroma(hexColor).set('hsl.l', 0.2),
    ])
      .mode('lab')
      .colors(19);

    scaleColors.forEach((color, index) => {
      const incrementValue = 50 + index * 50;
      const incrementName = `--${readableName}-${incrementValue}`;

      if (existingVariables.has(incrementName)) {
        colorScale.push({
          name: incrementName,
          value: existingVariables.get(incrementName)!,
        });
      } else {
        colorScale.push({
          name: incrementName,
          value: color,
        });
        existingVariables.set(incrementName, color);
      }
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
