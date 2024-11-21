import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';

import { CssVariableExtractorService } from './css-variable-extractor.service';

describe('CssVariableExtractorService', () => {
  let service: CssVariableExtractorService;

  // Assemble
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CssVariableExtractorService],
    });
    service = TestBed.inject(CssVariableExtractorService);
  });

  it('should be created', () => {
    // Act
    const createdService = TestBed.inject(CssVariableExtractorService);

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

  it('should handle checkboxes correctly', () => {
    // Assemble
    const fb = new FormBuilder();
    const cssForm: FormGroup = fb.group({
      mergeDuplicates: [false],
      overrideVariableNames: [{ value: false, disabled: true }],
    });

    // Act
    service.handleCheckboxes(cssForm);

    // Assert
    cssForm.get('mergeDuplicates')?.setValue(true);
    expect(cssForm.get('overrideVariableNames')?.disabled).toBe(true);
    expect(cssForm.get('overrideVariableNames')?.value).toBe(false);

    cssForm.get('mergeDuplicates')?.setValue(false);
    expect(cssForm.get('overrideVariableNames')?.enabled).toBe(true);

    cssForm.get('overrideVariableNames')?.setValue(true);
    expect(cssForm.get('mergeDuplicates')?.disabled).toBe(true);
    expect(cssForm.get('mergeDuplicates')?.value).toBe(false);

    cssForm.get('overrideVariableNames')?.setValue(false);
    expect(cssForm.get('mergeDuplicates')?.enabled).toBe(true);
  });
});
