import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { CssVariableExtractorService } from './css-variable-extractor.service';
import { CssVariableStoreService } from './css-variable-extractor.store';

describe('CssVariableStoreService', () => {
  let service: CssVariableStoreService;
  let cssVariableExtractorService: jest.Mocked<CssVariableExtractorService>;

  // Assemble
  beforeEach(() => {
    const spy = {
      convertToCssVariables: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        CssVariableStoreService,
        FormBuilder,
        { provide: CssVariableExtractorService, useValue: spy },
      ],
    });

    service = TestBed.inject(CssVariableStoreService);
    cssVariableExtractorService = TestBed.inject(
      CssVariableExtractorService,
    ) as jest.Mocked<CssVariableExtractorService>;
  });

  it('should be created', () => {
    // Act
    const createdService = TestBed.inject(CssVariableStoreService);

    // Assert
    expect(createdService).toBeTruthy();
  });

  it('should initialize forms', () => {
    // Act
    const state = service.get();

    // Assert
    expect(state.cssForm).toBeTruthy();
    expect(state.exportForm).toBeTruthy();
  });

  it('should set step', () => {
    // Act
    service.setStep(1);
    const state = service.get();

    // Assert
    expect(state.activeStep).toBe(1);
  });

  it('should parse CSS', () => {
    // Assemble
    cssVariableExtractorService.convertToCssVariables.mockReturnValue([
      { name: '--example-color', value: 'red' },
    ]);
    service.patchState({
      cssForm: new FormBuilder().group({
        cssInput: ['body { color: red; }'],
        jsonInput: [''],
        mergeDuplicates: [true],
        xpath: [''],
      }),
    });

    // Act
    service.parseCss();
    const state = service.get();

    // Assert
    expect(state.extractedVariables).toEqual([
      { name: '--example-color', value: 'red' },
    ]);
    expect(state.activeStep).toBe(1);
  });

  it('should clear input', () => {
    // Assemble
    service.patchState({
      cssForm: new FormBuilder().group({
        cssInput: ['body { color: red; }'],
        jsonInput: [''],
        mergeDuplicates: [true],
        xpath: [''],
      }),
    });

    // Act
    service.clearInput();
    const state = service.get();

    // Assert
    expect(state.cssForm?.get('cssInput')?.value).toBe('');
    expect(state.activeStep).toBe(0);
  });

  it('should export variables', () => {
    // Assemble
    service.patchState({
      extractedVariables: [{ name: '--example-color', value: 'red' }],
      exportForm: new FormBuilder().group({
        'export-0': [true],
        'name-0': ['--example-color'],
        'value-0': ['red'],
      }),
    });

    // Act
    service.exportVariables();
    const state = service.get();

    // Assert
    expect(state.customVariables).toEqual([
      { name: '--example-color', value: 'red' },
    ]);
    expect(state.activeStep).toBe(2);
  });

  it('should copy to clipboard', (done) => {
    // Assemble
    jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    service.patchState({
      customVariables: [{ name: '--example-color', value: 'red' }],
    });

    // Act
    service.copyToClipboard(of(undefined)).subscribe(() => {
      // Assert
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify([{ name: '--example-color', value: 'red' }], null, 2),
      );
      done();
    });
  });

  it('should process next item', () => {
    // Assemble
    service.patchState({
      cssForm: new FormBuilder().group({
        cssInput: [''],
        jsonInput: [
          [
            { id: 1, name: 'Example 1', css: 'body { color: red; }' },
            { id: 2, name: 'Example 2', css: 'body { color: blue; }' },
          ],
        ],
        mergeDuplicates: [true],
        xpath: ['css'],
      }),
      jsonItemCount: 2,
      currentItemIndex: 0,
    });

    // Act
    service.processNextItem(of(undefined)).subscribe(() => {
      const state = service.get();

      // Assert
      expect(state.cssForm?.get('cssInput')?.value).toBe(
        'body { color: red; }',
      );
      expect(state.currentItemIndex).toBe(1);
    });
  });

  it('should export to file', (done) => {
    // Assemble
    jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: jest.fn(),
    } as any);
    service.patchState({
      customVariables: [{ name: '--example-color', value: 'red' }],
      cssForm: new FormBuilder().group({
        jsonInput: [
          [
            { id: 1, name: 'Example 1', css: 'body { color: red; }' },
            { id: 2, name: 'Example 2', css: 'body { color: blue; }' },
          ],
        ],
        fileName: ['custom-variables'],
      }),
      currentItemIndex: 0,
    });

    // Act
    service.exportToFile(of(undefined)).subscribe(() => {
      // Assert
      expect(document.createElement).toHaveBeenCalledWith('a');
      done();
    });
  });

  it('should handle file input', (done) => {
    // Assemble
    const file = new Blob([JSON.stringify([{ id: 1, name: 'Example 1' }])], {
      type: 'application/json',
    });
    const event = {
      target: { files: [file] },
    } as unknown as Event;

    // Act
    service.handleFileInput(of(event)).subscribe(() => {
      const state = service.get();

      // Assert
      expect(state.cssForm?.get('jsonInput')?.value).toEqual([
        { id: 1, name: 'Example 1' },
      ]);
      expect(state.jsonItemCount).toBe(1);
      done();
    });
  });
});
