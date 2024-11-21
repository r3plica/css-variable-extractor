import { TestBed } from '@angular/core/testing';

import { ColorService } from './color.service';
import { CssVariable } from '../store/css-variable-extractor.service';

describe('ColorService', () => {
  let service: ColorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColorService],
    });
    service = TestBed.inject(ColorService);
  });

  it('should be created', () => {
    // Assert
    expect(service).toBeTruthy();
  });

  it('should generate color scale for preset colors', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: 'primary', value: '#ff0000' },
      { name: 'secondary', value: '#00ff00' },
      { name: 'accent', value: '#0000ff' },
    ];

    // Act
    const colorScale = service.generateColorScale(variables);

    // Assert
    expect(Object.keys(colorScale).length).toBe(57); // 3 colors * 19 increments each
    expect(colorScale['--primary-000']).toBeDefined();
    expect(colorScale['--secondary-000']).toBeDefined();
    expect(colorScale['--accent-000']).toBeDefined();
  });

  it('should generate color scale for custom colors', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: '--custom-color', value: '#ff00ff' },
    ];

    // Act
    const colorScale = service.generateColorScale(variables);

    // Assert
    expect(Object.keys(colorScale).length).toBe(19); // 1 color * 19 increments
    expect(colorScale['--custom-color-000']).toBeDefined();
  });

  it('should handle mixed preset and custom colors', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: 'primary', value: '#ff0000' },
      { name: '--custom-color', value: '#ff00ff' },
    ];

    // Act
    const colorScale = service.generateColorScale(variables);

    // Assert
    expect(Object.keys(colorScale).length).toBe(38); // 2 colors * 19 increments each
    expect(colorScale['--primary-000']).toBeDefined();
    expect(colorScale['--custom-color-000']).toBeDefined();
  });

  it('should generate correct color increments for preset colors', () => {
    // Assemble
    const colorScale: { [key: string]: string } = {};
    const name = 'primary';
    const hexColor = '#ff0000';

    // Act
    service['generatePresetColorScale'](name, hexColor, colorScale);

    // Assert
    expect(Object.keys(colorScale).length).toBe(19);
    expect(colorScale['--primary-000']).toBeDefined();
  });

  it('should generate correct color increments for custom colors', () => {
    // Assemble
    const colorScale: { [key: string]: string } = {};
    const readableName = 'custom-color';
    const hexColor = '#ff00ff';

    // Act
    service['generateColorIncrements'](hexColor, readableName, colorScale);

    // Assert
    expect(Object.keys(colorScale).length).toBe(19);
    expect(colorScale['--custom-color-000']).toBeDefined();
  });
});
