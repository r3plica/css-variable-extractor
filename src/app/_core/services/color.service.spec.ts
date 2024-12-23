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
      { name: '--primary', value: '#ff0000' },
      { name: '--secondary', value: '#00ff00' },
      { name: '--accent', value: '#0000ff' },
    ];

    // Act
    const scaledVariables = service.generateColorScale(variables);

    // Assert
    expect(scaledVariables.length).toBe(36);
    expect(scaledVariables.find((v) => v.name === '--primary')).toBeDefined();
    expect(scaledVariables.find((v) => v.name === '--secondary')).toBeDefined();
    expect(scaledVariables.find((v) => v.name === '--accent')).toBeDefined();
  });

  it('should generate color scale for custom colors', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: '--custom-color', value: '#ff00ff' },
    ];

    // Act
    const scaledVariables = service.generateColorScale(variables);

    // Assert
    expect(scaledVariables.length).toBe(12);
    expect(
      scaledVariables.find((v) => v.name === '--custom-color-50'),
    ).toBeDefined();
    expect(
      scaledVariables.find((v) => v.name === '--custom-color')?.value,
    ).toBe('#ff00ff');
    expect(
      scaledVariables.find((v) => v.name === '--custom-color-500')?.value,
    ).toBe('#ff00ff');
  });

  it('should handle mixed preset and custom colors', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: '--primary', value: '#ff0000' },
      { name: '--custom-color', value: '#ff00ff' },
    ];

    // Act
    const scaledVariables = service.generateColorScale(variables);

    // Assert
    expect(scaledVariables.length).toBe(24);
    expect(
      scaledVariables.find((v) => v.name === '--primary-50'),
    ).toBeDefined();
    expect(scaledVariables.find((v) => v.name === '--primary')?.value).toBe(
      '#ff0000',
    );
    expect(scaledVariables.find((v) => v.name === '--primary-500')?.value).toBe(
      '#ff0000',
    );
    expect(
      scaledVariables.find((v) => v.name === '--custom-color-50'),
    ).toBeDefined();
    expect(
      scaledVariables.find((v) => v.name === '--custom-color')?.value,
    ).toBe('#ff00ff');
    expect(
      scaledVariables.find((v) => v.name === '--custom-color-500')?.value,
    ).toBe('#ff00ff');
  });

  it('should generate correct color increments', () => {
    // Assemble
    const scaledVariables: CssVariable[] = [];
    const name = '--custom-color';
    const hexColor = '#ff00ff';
    const originalVariables = new Map<string, string>([[name, hexColor]]);

    // Act
    service['generateColorIncrements'](
      hexColor,
      name,
      scaledVariables,
      originalVariables,
    );

    // Assert
    expect(scaledVariables.length).toBe(12);
    expect(
      scaledVariables.find((v) => v.name === '--custom-color-50'),
    ).toBeDefined();
    expect(
      scaledVariables.find((v) => v.name === '--custom-color')?.value,
    ).toBe('#ff00ff');
    expect(
      scaledVariables.find((v) => v.name === '--custom-color-500')?.value,
    ).toBe('#ff00ff');
  });

  it('should ignore invalid hex values', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: '--invalid', value: 'not-a-hex' },
      { name: '--primary', value: '#ff0000' },
    ];

    // Act
    const scaledVariables = service.generateColorScale(variables);

    // Assert
    expect(scaledVariables.length).toBe(12);
    expect(
      scaledVariables.find((v) => v.name === '--primary-50'),
    ).toBeDefined();
    expect(scaledVariables.find((v) => v.name === '--primary')?.value).toBe(
      '#ff0000',
    );
    expect(scaledVariables.find((v) => v.name === '--primary')?.value).toBe(
      '#ff0000',
    );
    expect(
      scaledVariables.find((v) => v.name === '--invalid-50'),
    ).toBeUndefined();
  });

  it('should skip creating increments if name already exists', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: '--tru-on-warn-300', value: '#7f1d1d' },
      { name: '--tru-on-warn', value: '#7f1d1d' },
    ];

    // Act
    const scaledVariables = service.generateColorScale(variables);

    // Assert
    expect(scaledVariables.length).toBe(12);
    expect(
      scaledVariables.find((v) => v.name === '--tru-on-warn-50'),
    ).toBeDefined();
    expect(scaledVariables.find((v) => v.name === '--tru-on-warn')?.value).toBe(
      '#7f1d1d',
    );
    expect(
      scaledVariables.find((v) => v.name === '--tru-on-warn-500')?.value,
    ).toBe('#7f1d1d');
    expect(
      scaledVariables.find((v) => v.name === '--tru-on-warn-300')?.value,
    ).toBe('#7f1d1d');
  });

  it('should handle existing names in the input list', () => {
    // Assemble
    const variables: CssVariable[] = [
      { name: '--existing-color-50', value: '#ff0000' },
      { name: '--existing-color', value: '#ff0000' },
    ];

    // Act
    const scaledVariables = service.generateColorScale(variables);

    // Assert
    expect(scaledVariables.length).toBe(12);
    expect(
      scaledVariables.find((v) => v.name === '--existing-color-50'),
    ).toBeDefined();
    expect(
      scaledVariables.find((v) => v.name === '--existing-color-100'),
    ).toBeDefined();
    expect(
      scaledVariables.find((v) => v.name === '--existing-color')?.value,
    ).toBe('#ff0000');
    expect(
      scaledVariables.find((v) => v.name === '--existing-color-500')?.value,
    ).toBe('#ff0000');
  });

  describe('rgbToHex', () => {
    it('should convert rgb to hex', () => {
      // Assemble
      const css = `
        .example {
          color: rgb(255, 0, 0);
        }
      `;
      const expectedOutput = `
        .example {
          color: #ff0000;
        }
      `;

      // Act
      const result = service.rgbToHex(css);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should convert rgba to hex with transparency', () => {
      // Assemble
      const css = `
        .example {
          background-color: rgba(0, 255, 0, 0.5);
        }
      `;
      const expectedOutput = `
        .example {
          background-color: #00ff0080;
        }
      `;

      // Act
      const result = service.rgbToHex(css);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should handle multiple rgb and rgba values in the same CSS', () => {
      // Assemble
      const css = `
        .example {
          color: rgb(255, 0, 0);
          background-color: rgba(0, 255, 0, 0.5);
          border-color: rgb(0, 0, 255);
        }
      `;
      const expectedOutput = `
        .example {
          color: #ff0000;
          background-color: #00ff0080;
          border-color: #0000ff;
        }
      `;

      // Act
      const result = service.rgbToHex(css);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should return the original CSS if an invalid color is encountered', () => {
      // Assemble
      const css = `
        .example {
          color: invalidColor(255, 0, 0);
        }
      `;
      const expectedOutput = css;

      // Act
      const result = service.rgbToHex(css);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should handle empty CSS input gracefully', () => {
      // Assemble
      const css = ``;
      const expectedOutput = ``;

      // Act
      const result = service.rgbToHex(css);

      // Assert
      expect(result).toBe(expectedOutput);
    });
  });
});
