import { Injectable } from '@angular/core';
import chroma, { scale } from 'chroma-js';

import { CssVariable } from '../store/css-variable-extractor.service';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  constructor() {}

  public generateColorScale(variables: CssVariable[]) {
    const colorScale: { [key: string]: string } = {};

    variables.forEach((variable) => {
      const { name, value } = variable;

      if (['primary', 'secondary', 'accent'].includes(name.toLowerCase())) {
        this.generatePresetColorScale(name, value, colorScale);
      } else {
        const readableName = variable.name.replace(/^--/, '');
        this.generateColorIncrements(value, readableName, colorScale);
      }
    });

    return colorScale;
  }

  private generatePresetColorScale(
    name: string,
    hexColor: string,
    colorScale: { [key: string]: string },
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
      if (incrementValue !== 0) {
        colorScale[`--${name}-${incrementValue.toString().padStart(3, '0')}`] =
          color;
      }
    });
  }

  private generateColorIncrements(
    hexColor: string,
    readableName: string,
    colorScale: { [key: string]: string },
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
      if (incrementValue !== 0) {
        colorScale[
          `--${readableName}-${incrementValue.toString().padStart(3, '0')}`
        ] = color;
      }
    });
  }
}
