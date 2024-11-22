/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/no-done-callback */
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ColorService } from '@services';

import { CssVariableExtractorStoreService } from './css-variable-extractor.store.service';
import { CssVariableExtractorStore } from './css-variable-extractor.store';

describe('CssVariableExtractorStore', () => {
  let service: CssVariableExtractorStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        CssVariableExtractorStore,
        FormBuilder,
        CssVariableExtractorStoreService,
        ColorService,
      ],
    });

    service = TestBed.inject(CssVariableExtractorStore);
  });

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'mocked-object-url');
    window.alert = jest.fn();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    // Assemble
    const createdService = TestBed.inject(CssVariableExtractorStore);

    // Assert
    expect(createdService).toBeTruthy();
  });

  it('should initialize forms', () => {
    // Act
    service.state$.subscribe((state) => {
      // Assert
      expect(state.cssForm).toBeTruthy();
      expect(state.exportForm).toBeTruthy();
    });
  });

  it('should set step', () => {
    // Assemble
    service.setStep(1);

    // Act
    service.state$.subscribe((state) => {
      // Assert
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
        { name: '--body-color', value: 'red' },
      ]);
      expect(state.activeStep).toBe(1);
    });
  });

  it('should handle invalid form in parseCss', () => {
    // Assemble
    service.patchState({
      cssForm: new FormBuilder().group({
        cssInput: [''],
        jsonInput: [''],
        mergeDuplicates: [true],
        xpath: [''],
      }),
    });

    // Act
    service.parseCss();

    // Assert
    service.state$.subscribe((state) => {
      expect(state.errors[0]).toBe('Please fix the errors before continuing');
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

  it('should apply overrides with array format', () => {
    // Assemble
    service.patchState({
      customVariables: [
        { name: 'oldName', value: 'someValue' },
        { name: 'unmatchedName', value: 'someValue' },
      ],
      cssForm: new FormBuilder().group({
        overrides: ['[["oldName", "newName"]]'],
      }),
    });

    // Act
    service.applyOverrides();

    // Assert
    service.state$.subscribe((state) => {
      expect(state.customVariables).toEqual([
        { name: 'newName', value: 'someValue' },
      ]);
      expect(state.activeStep).toBe(3);
    });
  });

  it('should apply overrides with object format', () => {
    // Assemble
    service.patchState({
      customVariables: [
        { name: 'oldName', value: 'someValue' },
        { name: 'unmatchedName', value: 'someValue' },
      ],
      cssForm: new FormBuilder().group({
        overrides: ['{"oldName": "newName"}'],
      }),
    });

    // Act
    service.applyOverrides();

    // Assert
    service.state$.subscribe((state) => {
      expect(state.customVariables).toEqual([
        { name: 'newName', value: 'someValue' },
      ]);
      expect(state.activeStep).toBe(3);
    });
  });

  it('should handle invalid overrides format', () => {
    // Assemble
    service.patchState({
      customVariables: [
        { name: 'oldName', value: 'someValue' },
        { name: 'unmatchedName', value: 'someValue' },
      ],
      cssForm: new FormBuilder().group({
        overrides: ['invalid-format'],
      }),
    });

    // Act
    service.applyOverrides();

    // Assert
    service.state$.subscribe((state) => {
      expect(state.customVariables).toEqual([
        { name: 'oldName', value: 'someValue' },
        { name: 'unmatchedName', value: 'someValue' },
      ]);
      expect(state.activeStep).toBe(3);
    });
  });

  it('should handle empty overrides', () => {
    // Assemble
    service.patchState({
      customVariables: [
        { name: 'oldName', value: 'someValue' },
        { name: 'unmatchedName', value: 'someValue' },
      ],
      cssForm: new FormBuilder().group({
        overrides: [''],
      }),
    });

    // Act
    service.applyOverrides();

    // Assert
    service.state$.subscribe((state) => {
      expect(state.customVariables).toEqual([
        { name: 'oldName', value: 'someValue' },
        { name: 'unmatchedName', value: 'someValue' },
      ]);
      expect(state.activeStep).toBe(3);
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
    service.export(of(undefined));

    // Assert
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should export all items to a single file', (done) => {
    // Assemble
    jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: jest.fn(),
    } as any);
    service.patchState({
      cssForm: new FormBuilder().group({
        jsonInput: [
          [
            { id: 1, name: 'Example 1', css: 'body { color: red; }' },
            { id: 2, name: 'Example 2', css: 'body { color: blue; }' },
          ],
        ],
        mergeDuplicates: [true],
        xpath: ['css'],
        overrides: ['{"--body-color": "--custom-color"}'],
        addShades: [true],
      }),
      jsonItemCount: 2,
      currentItemIndex: 0,
    });

    // Act
    service.export(of(undefined));

    // Assert
    service.state$.subscribe(() => {
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

  it('should handle non-array JSON in handleFileInput', (done) => {
    // Assemble
    const file = new Blob([JSON.stringify({ id: 1, name: 'Example 1' })], {
      type: 'application/json',
    });
    const event = {
      target: { files: [file] },
    } as unknown as Event;
    const mockReader = {
      readAsText: jest.fn(),
      result: JSON.stringify({ id: 1, name: 'Example 1' }),
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

  it('should handle invalid JSON in handleFileInput', (done) => {
    // Assemble
    const file = new Blob(['invalid-json'], { type: 'application/json' });
    const event = {
      target: { files: [file] },
    } as unknown as Event;
    const mockReader = {
      readAsText: jest.fn(),
      result: 'invalid-json',
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
      expect(state.cssForm?.get('jsonInput')?.value).toEqual('');
      expect(state.jsonItemCount).toBe(0);
      done();
    });
  });

  it('should handle empty file input', () => {
    // Assemble
    const event = {
      target: { files: [] },
    } as unknown as Event;

    // Act
    service.handleFileInput(of(event));

    // Assert
    service.state$.subscribe((state) => {
      expect(state.jsonItemCount).toBe(0);
    });
  });

  it('should handle file read error', (done) => {
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
      error: 'File read error',
    };
    Object.defineProperty(mockReader, 'onload', {
      set(callback) {
        callback();
      },
    });
    Object.defineProperty(mockReader, 'onerror', {
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
      expect(state.cssForm?.get('jsonInput')?.value).toEqual('');
      expect(state.jsonItemCount).toBe(0);
      done();
    });
  });
});
