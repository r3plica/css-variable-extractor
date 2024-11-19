/* eslint-disable jest/no-done-callback */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, take } from 'rxjs';

import { CssVariableExtractorService } from './css-variable-extractor.service';
import { CssVariableStoreService } from './css-variable-extractor.store';

describe('CssVariableStoreService', () => {
  let service: CssVariableStoreService;

  // Assemble
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        CssVariableStoreService,
        FormBuilder,
        CssVariableExtractorService,
      ],
    });

    service = TestBed.inject(CssVariableStoreService);
  });

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'mocked-object-url');
    window.alert = jest.fn();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    // Act
    const createdService = TestBed.inject(CssVariableStoreService);

    // Assert
    expect(createdService).toBeTruthy();
  });

  it('should initialize forms', () => {
    // Act
    // Assert
    service.state$.subscribe((state) => {
      expect(state.cssForm).toBeTruthy();
      expect(state.exportForm).toBeTruthy();
    });
  });

  it('should set step', () => {
    // Act
    service.setStep(1);

    // Assert
    service.state$.subscribe((state) => {
      expect(state.activeStep).toBe(1);
    });
  });

  it('should parse CSS', () => {
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
    service.parseCss();

    // Assert
    service.state$.subscribe((state) => {
      expect(state.extractedVariables).toEqual([
        { name: '--example-color', value: 'red' },
      ]);
      expect(state.activeStep).toBe(1);
    });
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

    // Assert
    service.state$.subscribe((state) => {
      expect(state.cssForm?.get('cssInput')?.value).toBe('');
      expect(state.activeStep).toBe(0);
    });
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

    // Assert
    service.state$.subscribe((state) => {
      expect(state.customVariables).toEqual([
        { name: '--example-color', value: 'red' },
      ]);
      expect(state.activeStep).toBe(2);
    });
  });

  it('should copy to clipboard', () => {
    // Assemble
    const clipboardWriteTextMock = jest.fn().mockResolvedValue({});
    Object.defineProperty(global, 'navigator', {
      value: {
        clipboard: {
          writeText: clipboardWriteTextMock,
        },
      },
      writable: true,
    });
    service.patchState({
      customVariables: [{ name: '--example-color', value: 'red' }],
    });

    // Act
    service.copyToClipboard(of(undefined));

    // Assert
    expect(clipboardWriteTextMock).toHaveBeenCalledWith(
      JSON.stringify([{ name: '--example-color', value: 'red' }], null, 2),
    );
  });

  it('should process next item', (done) => {
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
    service.processNextItem(of(undefined));

    // Assert
    service.state$.subscribe((state) => {
      state.extractedVariables.forEach((variable) => {
        expect(variable.name).toBe('--body-color');
        expect(variable.value).toBe('red');
      });
      expect(state.currentItemIndex).toBe(1);
      done();
    });
  });

  it('should process next item and parse new CSS', (done) => {
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

    // Act & Assert
    service.parseCss();

    service.state$.pipe(take(1)).subscribe((state) => {
      state.extractedVariables.forEach((variable) => {
        expect(variable.name).toBe('--body-color');
        expect(variable.value).toBe('red');
      });
      expect(state.currentItemIndex).toBe(0);

      service.processNextItem();
      service.parseCss();

      service.state$.pipe(take(1)).subscribe((state) => {
        state.extractedVariables.forEach((variable) => {
          expect(variable.name).toBe('--body-color');
          expect(variable.value).toBe('blue');
        });
        expect(state.currentItemIndex).toBe(1);
        done();
      });
    });
  });

  it('should process next item and parse new CSS and create custom variables', (done) => {
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

    // Act & Assert
    service.parseCss();
    service.exportVariables();

    service.state$.pipe(take(1)).subscribe((state) => {
      state.extractedVariables.forEach((variable) => {
        expect(variable.name).toBe('--body-color');
        expect(variable.value).toBe('red');
      });
      expect(state.customVariables).toEqual([
        { name: '--body-color', value: 'red' },
      ]);
      expect(state.currentItemIndex).toBe(0);

      service.processNextItem();
      service.parseCss();
      service.exportVariables();

      service.state$.pipe(take(1)).subscribe((state) => {
        state.extractedVariables.forEach((variable) => {
          expect(variable.name).toBe('--body-color');
          expect(variable.value).toBe('blue');
        });
        expect(state.customVariables).toEqual([
          { name: '--body-color', value: 'blue' },
        ]);
        expect(state.currentItemIndex).toBe(1);
        done();
      });
    });
  });

  it('should export to file', () => {
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
    service.exportToFile(of(undefined));

    // Assert
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should handle file input', (done) => {
    // Assemble
    const file = new Blob([JSON.stringify([{ id: 1, name: 'Example 1' }])], {
      type: 'application/json',
    });
    const event = {
      target: { files: [file] },
    } as unknown as Event;
    const mockReader = {
      readAsText: jest.fn(),
      result: JSON.stringify([{ id: 1, name: 'Example 1' }]),
    };
    Object.defineProperty(mockReader, 'onload', {
      set(callback) {
        callback();
      },
    });
    jest
      .spyOn(window, 'FileReader')
      .mockImplementation(() => mockReader as unknown as FileReader);

    // Act
    service.handleFileInput(of(event));

    // Assert
    service.state$.subscribe((state) => {
      expect(state.cssForm?.get('jsonInput')?.value).toEqual([
        { id: 1, name: 'Example 1' },
      ]);
      expect(state.jsonItemCount).toBe(1);
      done();
    });
  });
});
