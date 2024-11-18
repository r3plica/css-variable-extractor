import { TestBed } from '@angular/core/testing';

import { CssVariableExtractorService } from './css-variable-extractor.service';

describe('CssVariableExtractorService', () => {
  let service: CssVariableExtractorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CssVariableExtractorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert CSS properties to CSS variables', () => {
    const css = `
      .example {
        color: #ff0000;
        background-color: blue;
      }
    `;
    const result = service.convertToCssVariables(css);
    expect(result.variables).toEqual([
      { name: '--example-color', value: '#ff0000' },
      { name: '--example-background-color', value: 'blue' },
    ]);
    expect(result.updatedCss).toContain('color: var(--example-color);');
    expect(result.updatedCss).toContain(
      'background-color: var(--example-background-color);'
    );
  });

  it('should handle CSS without color properties', () => {
    const css = `
      .example {
        margin: 10px;
        padding: 20px;
      }
    `;
    const result = service.convertToCssVariables(css);
    expect(result.variables).toEqual([]);
    expect(result.updatedCss).toContain('margin: 10px;');
    expect(result.updatedCss).toContain('padding: 20px;');
  });

  it('should handle empty CSS', () => {
    const css = '';
    const result = service.convertToCssVariables(css);
    expect(result.variables).toEqual([]);
    expect(result.updatedCss).toBe('');
  });
});
