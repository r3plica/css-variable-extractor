import { TestBed } from '@angular/core/testing';

import { CssVariable } from '@models';

import { ColorService } from './color.service';

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
    expect(colorScale.length).toBe(57);
    expect(colorScale.find((v) => v.name === '--primary-50')).toBeDefined();
    expect(colorScale.find((v) => v.name === '--secondary-50')).toBeDefined();
    expect(colorScale.find((v) => v.name === '--accent-50')).toBeDefined();
  });

  it('should generate color scale for custom colors', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: '--custom-color', value: '#ff00ff' },
    ];

    // Act
    const colorScale = service.generateColorScale(variables);

    // Assert
    expect(colorScale.length).toBe(19);
    expect(
      colorScale.find((v) => v.name === '--custom-color-50'),
    ).toBeDefined();
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
    expect(colorScale.length).toBe(38);
    expect(colorScale.find((v) => v.name === '--primary-50')).toBeDefined();
    expect(
      colorScale.find((v) => v.name === '--custom-color-50'),
    ).toBeDefined();
  });

  it('should generate correct color increments', () => {
    // Assemble
    const colorScale: CssVariable[] = [];
    const readableName = 'custom-color';
    const hexColor = '#ff00ff';
    const existingVariables = new Map<string, string>();

    // Act
    service['generateColorIncrements'](
      hexColor,
      readableName,
      colorScale,
      existingVariables,
    );

    // Assert
    expect(colorScale.length).toBe(19);
    expect(
      colorScale.find((v) => v.name === '--custom-color-50'),
    ).toBeDefined();
  });

  it('should ignore invalid hex values', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: 'invalid', value: 'not-a-hex' },
      { name: 'primary', value: '#ff0000' },
    ];

    // Act
    const colorScale = service.generateColorScale(variables);

    // Assert
    expect(colorScale.length).toBe(19);
    expect(colorScale.find((v) => v.name === '--primary-50')).toBeDefined();
    expect(colorScale.find((v) => v.name === '--invalid-50')).toBeUndefined();
  });

  it('should skip creating increments if name already exists', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: '--tru-on-warn-300', value: '#7f1d1d' },
      { name: '--tru-on-warn', value: '#7f1d1d' },
    ];

    // Act
    const colorScale = service.generateColorScale(variables);

    // Assert
    expect(colorScale.length).toBe(19);
    expect(colorScale.find((v) => v.name === '--tru-on-warn-50')).toBeDefined();
    expect(
      colorScale.find((v) => v.name === '--tru-on-warn-300'),
    ).toBeDefined();
  });

  it('should handle existing names in the input list', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: '--existing-color-50', value: '#ff0000' },
      { name: '--existing-color', value: '#ff0000' },
    ];

    // Act
    const colorScale = service.generateColorScale(variables);

    // Assert
    expect(colorScale.length).toBe(19);
    expect(
      colorScale.find((v) => v.name === '--existing-color-50'),
    ).toBeDefined();
    expect(
      colorScale.find((v) => v.name === '--existing-color-100'),
    ).toBeDefined();
  });
});
