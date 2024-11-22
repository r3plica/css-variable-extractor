import { Injectable } from '@angular/core';
import chroma, { scale } from 'chroma-js';

import { CssVariable } from '@models';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  public generateColorScale(variables: CssVariable[]): CssVariable[] {
    const colorScale: CssVariable[] = [];

    variables.forEach((variable) => {
      const { name, value } = variable;
      if (!this.isValidHex(value)) return;

      const readableName = name.replace(/^--/, '');
      this.generateColorIncrements(value, readableName, colorScale);
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
      const incrementName = `--${readableName}-${incrementValue.toString()}`;
      if (colorScale.find((variable) => variable.name === incrementName))
        return;

      colorScale.push({
        name: incrementName,
        value: color,
      });
    });
  }
}
