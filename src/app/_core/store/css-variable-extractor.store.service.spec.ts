import { TestBed } from '@angular/core/testing';

import { CssVariableExtractorStoreService } from './css-variable-extractor.store.service';

describe('CssVariableExtractorStoreService', () => {
  let service: CssVariableExtractorStoreService;

  // Assemble
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CssVariableExtractorStoreService],
    });
    service = TestBed.inject(CssVariableExtractorStoreService);
  });

  it('should be created', () => {
    // Act
    const createdService = TestBed.inject(CssVariableExtractorStoreService);

    // Assert
    expect(createdService).toBeTruthy();
  });

  it('should convert CSS to variables', () => {
    // Assemble
    const css = `
      .example {
        color: #ff0000;
        background-color: blue;
      }
    `;

    // Act
    const result = service.convertToCssVariables(css, false);

    // Assert
    expect(result).toEqual([
      { name: '--example-background-color', value: 'blue' },
      { name: '--example-color', value: '#ff0000' },
    ]);
  });

  it('should merge duplicate values', () => {
    // Assemble
    const css = `
      .example1 {
        color: #ff0000;
      }
      .example2 {
        color: #ff0000;
      }
    `;

    // Act
    const result = service.convertToCssVariables(css, true);

    // Assert
    expect(result).toEqual([{ name: '--example1-color', value: '#ff0000' }]);
  });

  it('should sort variables by value', () => {
    // Assemble
    const css = `
      .example1 {
        color: #ff0000;
      }
      .example2 {
        color: #00ff00;
      }
      .example3 {
        color: #0000ff;
      }
    `;

    // Act
    const result = service.convertToCssVariables(css, false);

    // Assert
    expect(result).toEqual([
      { name: '--example3-color', value: '#0000ff' },
      { name: '--example2-color', value: '#00ff00' },
      { name: '--example1-color', value: '#ff0000' },
    ]);
  });

  it('should remove duplicate values', () => {
    // Assemble
    const variables = [
      { name: '--example1-color', value: '#ff0000' },
      { name: '--example2-color', value: '#ff0000' },
    ];

    // Act
    const result = service['_removeDuplicateValues'](variables);

    // Assert
    expect(result).toEqual([{ name: '--example1-color', value: '#ff0000' }]);
  });

  it('should get sort value for hex color', () => {
    // Assemble
    const hex = '#ff0000';

    // Act
    const result = service['_getSortValue'](hex);

    // Assert
    expect(result).toBe(16711680);
  });

  it('should get sort value for rgb color', () => {
    // Assemble
    const rgb = 'rgb(255, 0, 0)';

    // Act
    const result = service['_getSortValue'](rgb);

    // Assert
    expect(result).toBe(16711680);
  });

  describe('_cleanCss', () => {
    it('should remove single-line comments and clean up extra spaces', () => {
      // Arrange
      const inputCss = `
        /* This is a comment */
        .example {
          color: red; // Single line comment
          background-color: blue;
        }
      `;
      const expectedOutput = '.example{color:red;background-color:blue;}';

      // Act
      const result = service['_cleanCss'](inputCss);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should remove multi-line comments and normalize spacing', () => {
      // Arrange
      const inputCss = `
        /* This is a
           multi-line comment */
        .example {
          color: red;
          background-color: blue;
        }
      `;
      const expectedOutput = '.example{color:red;background-color:blue;}';

      // Act
      const result = service['_cleanCss'](inputCss);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should remove all newlines and carriage returns', () => {
      // Arrange
      const inputCss = `
        html,\r\nbody {    \r\nbackground-color: rgba(255, 255, 255, 1);\r\ncolor: rgba(195, 68, 51, 1);\r\n}
      `;
      const expectedOutput =
        'html,body{background-color:rgba(255,255,255,1);color:rgba(195,68,51,1);}';

      // Act
      const result = service['_cleanCss'](inputCss);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should handle missing semicolons correctly', () => {
      // Arrange
      const inputCss = `
        .example {
          color: red;
          background-color: blue
        }
      `;
      const expectedOutput = '.example{color:red;background-color:blue;}';

      // Act
      const result = service['_cleanCss'](inputCss);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should normalize excessive spaces to a single space', () => {
      // Arrange
      const inputCss = `
        .example {
          color:      red;     background-color:   blue;
        }
      `;
      const expectedOutput = '.example{color:red;background-color:blue;}';

      // Act
      const result = service['_cleanCss'](inputCss);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should handle empty CSS input', () => {
      // Arrange
      const inputCss = '';
      const expectedOutput = '';

      // Act
      const result = service['_cleanCss'](inputCss);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should handle CSS with only comments', () => {
      // Arrange
      const inputCss = `
        /* This is a comment */
        /* Another comment */
      `;
      const expectedOutput = '';

      // Act
      const result = service['_cleanCss'](inputCss);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should not affect valid CSS with no comments or extra spaces', () => {
      // Arrange
      const inputCss = '.valid{color:red;}';
      const expectedOutput = '.valid{color:red;}';

      // Act
      const result = service['_cleanCss'](inputCss);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should handle multiple spaces between selectors', () => {
      // Arrange
      const inputCss =
        '.example   {  color:red ; background-color  : blue  ;  }';
      const expectedOutput = '.example{color:red;background-color:blue;}';

      // Act
      const result = service['_cleanCss'](inputCss);

      // Assert
      expect(result).toBe(expectedOutput);
    });
  });

  describe('applyOverrides', () => {
    it('should apply multiple overrides for the same variable name', () => {
      // Assemble
      const extractedVariables = [
        { name: '--TopHeader-background-color', value: '#ff0000' },
        { name: '--tn-color-primary-color', value: '#00ff00' },
      ];
      const overridesString = JSON.stringify([
        ['--TopHeader-background-color', '--tru-primary'],
        ['--tn-color-primary-color', '--tru-primary'],
        ['--TopHeader-background-color', '--tru-accent'],
        ['--tn-color-primary-color', '--tru-accent'],
      ]);

      // Act
      const result = service.applyOverrides(
        extractedVariables,
        overridesString,
      );

      // Assert
      expect(result).toEqual([
        { name: '--tru-primary', value: '#ff0000' },
        { name: '--tru-accent', value: '#ff0000' },
      ]);
    });

    it('should handle duplicate overrides correctly', () => {
      // Assemble
      const extractedVariables = [
        { name: '--TopHeader-background-color', value: '#ff0000' },
        { name: '--tn-color-primary-color', value: '#00ff00' },
      ];
      const overridesString = JSON.stringify([
        ['--TopHeader-background-color', '--tru-primary'],
        ['--TopHeader-background-color', '--tru-accent'],
        ['--tn-color-primary-color', '--tru-primary'],
        ['--tn-color-primary-color', '--tru-accent'],
      ]);

      // Act
      const result = service.applyOverrides(
        extractedVariables,
        overridesString,
      );

      // Assert
      expect(result).toEqual([
        { name: '--tru-primary', value: '#ff0000' },
        { name: '--tru-accent', value: '#ff0000' },
      ]);
    });

    it('should handle empty overrides', () => {
      // Assemble
      const extractedVariables = [
        { name: 'oldName', value: 'someValue' },
        { name: 'unmatchedName', value: 'someValue' },
      ];
      const overridesString = '';

      // Act
      const result = service.applyOverrides(
        extractedVariables,
        overridesString,
      );

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle invalid overrides string', () => {
      // Assemble
      const extractedVariables = [
        { name: 'oldName', value: 'someValue' },
        { name: 'unmatchedName', value: 'someValue' },
      ];
      const overridesString = 'invalid-json';

      // Act
      const result = service.applyOverrides(
        extractedVariables,
        overridesString,
      );

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle no matching overrides', () => {
      // Assemble
      const extractedVariables = [
        { name: '--TopHeader-background-color', value: '#ff0000' },
        { name: '--tn-color-primary-color', value: '#00ff00' },
      ];
      const overridesString = JSON.stringify([
        ['--non-existent-variable', '--tru-primary'],
      ]);

      // Act
      const result = service.applyOverrides(
        extractedVariables,
        overridesString,
      );

      // Assert
      expect(result).toEqual([]);
    });
  });

  it('should save JSON to file', () => {
    // Assemble
    const mockCreateObjectURL = jest.fn(() => 'mock-url');
    const mockRevokeObjectURL = jest.fn();
    Object.defineProperty(window.URL, 'createObjectURL', {
      value: mockCreateObjectURL,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      value: mockRevokeObjectURL,
    });

    const mockClick = jest.fn();
    jest.spyOn(document, 'createElement').mockReturnValue({
      click: mockClick,
      set href(value: string) {},
      set download(value: string) {},
    } as unknown as HTMLAnchorElement);

    const data = JSON.stringify({ name: 'test' });
    const fileName = 'test-file';

    // Act
    service.saveJsonToFile(data, fileName);

    // Assert
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should validate CSS values', () => {
    // Assert
    expect(service['_isValidCssValue']('#ff0000')).toBe(true);
    expect(service['_isValidCssValue']('red')).toBe(true);
    // expect(service['_isValidCssValue']('invalid')).toBe(false); // TODO: do we need to fix this?
  });

  it('should generate variable names', () => {
    // Assemble
    const selector = '.example';
    const prop = 'color';

    // Act
    const result = service['_generateVariableName'](selector, prop);

    // Assert
    expect(result).toBe('--example-color');
  });

  it('should sanitize strings', () => {
    // Assemble
    const str = '.className';

    // Act
    const result = service['_sanitizeString'](str);

    // Assert
    expect(result).toBe('className');
  });

  it('should handle invalid CSS gracefully', () => {
    // Assemble
    const invalidCss = 'invalid-css';

    // Act
    const result = service.convertToCssVariables(invalidCss, false);

    // Assert
    expect(result).toEqual([]);
  });
});
