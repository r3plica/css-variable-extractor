/* eslint-disable jest/no-done-callback */
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ColorService } from '@services';

import { CssVariableExtractorStoreService } from './css-variable-extractor.store.service';
import {
  CssVariableExtractorStore,
  ExtractorState,
} from './css-variable-extractor.store';

describe('CssVariableExtractorStore', () => {
  let store: CssVariableExtractorStore;
  let storeService: jest.Mocked<CssVariableExtractorStoreService>;
  let colorService: jest.Mocked<ColorService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        CssVariableExtractorStore,
        FormBuilder,
        {
          provide: CssVariableExtractorStoreService,
          useValue: {
            applyOverrides: jest.fn(),
            convertToCssVariables: jest.fn(),
            saveJsonToFile: jest.fn(),
          },
        },
        {
          provide: ColorService,
          useValue: {
            generateColorScale: jest.fn(),
          },
        },
      ],
    });

    store = TestBed.inject(CssVariableExtractorStore);
    storeService = TestBed.inject(
      CssVariableExtractorStoreService,
    ) as jest.Mocked<CssVariableExtractorStoreService>;
    colorService = TestBed.inject(ColorService) as jest.Mocked<ColorService>;
  });

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'mocked-object-url');
    window.alert = jest.fn();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    const variables = [{ name: '--tru-primary', value: '#FF0000' }];
    storeService.convertToCssVariables.mockReturnValue(variables);
    storeService.applyOverrides.mockReturnValue(variables);
    colorService.generateColorScale.mockReturnValue(variables);
  });

  it('should be created', () => {
    // Assemble
    const createdService = TestBed.inject(CssVariableExtractorStore);

    // Assert
    expect(createdService).toBeTruthy();
  });

  it('should initialize forms', () => {
    // Act
    store.state$.subscribe((state) => {
      // Assert
      expect(state.cssForm).toBeTruthy();
      expect(state.exportForm).toBeTruthy();
    });
  });

  it('should set step', () => {
    // Assemble
    store.setStep(1);

    // Act
    store.state$.subscribe((state) => {
      // Assert
      expect(state.activeStep).toBe(1);
    });
  });

  describe('parseCss', () => {
    it('should handle parseCss when cssForm is not defined', () => {
      // Assemble
      store.setState({
        cssForm: undefined,
      } as unknown as ExtractorState);

      // Act
      store.parseCss();

      // Assert
      store.state$.subscribe((state) => {
        expect(state.customVariables).toEqual([]);
        expect(state.activeStep).toBe(1);
      });
    });

    it('should parse CSS', () => {
      // Assemble
      store.patchState({
        cssForm: new FormBuilder().group({
          cssInput: ['body { color: red; }'],
          jsonInput: [''],
          mergeDuplicates: [true],
          xpath: [''],
        }),
      });

      // Act
      store.parseCss();

      // Assert
      store.state$.subscribe((state) => {
        expect(state.extractedVariables).toEqual([
          { name: '--body-color', value: 'red' },
        ]);
        expect(state.activeStep).toBe(1);
      });
    });

    it('should handle invalid form in parseCss', () => {
      // Assemble
      store.patchState({
        cssForm: new FormBuilder().group({
          cssInput: [''],
          jsonInput: [''],
          mergeDuplicates: [true],
          xpath: [''],
        }),
      });

      // Act
      store.parseCss();

      // Assert
      store.state$.subscribe((state) => {
        expect(state.errors[0]).toBe('Please fix the errors before continuing');
      });
    });
  });

  describe('clearInput', () => {
    it('should clear input', () => {
      // Assemble
      store.patchState({
        cssForm: new FormBuilder().group({
          cssInput: ['body { color: red; }'],
          jsonInput: [''],
          mergeDuplicates: [true],
          xpath: [''],
        }),
      });

      // Act
      store.clearInput();

      // Assert
      store.state$.subscribe((state) => {
        expect(state.cssForm?.get('cssInput')?.value).toBe('');
        expect(state.activeStep).toBe(0);
      });
    });
  });

  describe('exportVariables', () => {
    it('should export variables', () => {
      // Assemble
      store.patchState({
        extractedVariables: [{ name: '--example-color', value: 'red' }],
        exportForm: new FormBuilder().group({
          'export-0': [true],
          'name-0': ['--example-color'],
          'value-0': ['red'],
        }),
      });

      // Act
      store.exportVariables();

      // Assert
      store.state$.subscribe((state) => {
        expect(state.customVariables).toEqual([
          { name: '--example-color', value: 'red' },
        ]);
        expect(state.activeStep).toBe(2);
        expect(colorService.generateColorScale).not.toHaveBeenCalled();
      });
    });

    it('should export variables and generate shades when not overriding', () => {
      // Assemble
      store.patchState({
        extractedVariables: [{ name: '--example-color', value: 'red' }],
        exportForm: new FormBuilder().group({
          'export-0': [true],
          'name-0': ['--example-color'],
          'value-0': ['red'],
        }),
        cssForm: new FormBuilder().group({
          addShades: [true],
          overrideVariableNames: [false],
        }),
      });

      // Act
      store.exportVariables();

      // Assert
      store.state$.subscribe((state) => {
        expect(state.customVariables).toEqual([
          { name: '--example-color', value: 'red' },
        ]);
        expect(state.activeStep).toBe(2);
        expect(colorService.generateColorScale).toHaveBeenCalled();
      });
    });

    it('should export variables and not generate shades when overriding', () => {
      // Assemble
      store.patchState({
        extractedVariables: [{ name: '--example-color', value: 'red' }],
        exportForm: new FormBuilder().group({
          'export-0': [true],
          'name-0': ['--example-color'],
          'value-0': ['red'],
        }),
        cssForm: new FormBuilder().group({
          addShades: [true],
          overrideVariableNames: [true],
        }),
      });

      // Act
      store.exportVariables();

      // Assert
      store.state$.subscribe((state) => {
        expect(state.customVariables).toEqual([
          { name: '--example-color', value: 'red' },
        ]);
        expect(state.activeStep).toBe(2);
        expect(colorService.generateColorScale).not.toHaveBeenCalled();
      });
    });
  });

  describe('applyOverrides', () => {
    it('should not apply overrides when no overrides control', () => {
      // Assemble
      store.setState({} as unknown as ExtractorState);

      // Act
      store.applyOverrides();

      // Assert
      store.state$.subscribe((state) => {
        expect(store.applyOverrides).not.toHaveBeenCalled();
        expect(state.activeStep).toBe(2);
      });
    });

    it('should not apply overrides when empty', () => {
      // Assemble
      store.patchState({
        extractedVariables: [{ name: '--example-color', value: 'red' }],
        cssForm: new FormBuilder().group({
          extractedVariables: [{ name: '--example-color', value: 'red' }],
          overrides: [''],
        }),
      });

      // Act
      store.applyOverrides();

      // Assert
      store.state$.subscribe((state) => {
        expect(store.applyOverrides).not.toHaveBeenCalled();
        expect(state.customVariables).toEqual([
          { name: '--example-color', value: 'red' },
        ]);
      });
    });

    it('should apply overrides', () => {
      // Assemble
      store.patchState({
        extractedVariables: [{ name: '--example-color', value: 'red' }],
        cssForm: new FormBuilder().group({
          extractedVariables: [{ name: '--example-color', value: 'red' }],
          overrides: ['{"--example-color": "--custom-color"}'],
        }),
      });

      // Act
      store.applyOverrides();

      // Assert
      store.state$.subscribe((state) => {
        expect(state.customVariables).toEqual([
          { name: '--custom-color', value: 'red' },
        ]);
        expect(storeService.applyOverrides).toHaveBeenCalled();
        expect(colorService.generateColorScale).not.toHaveBeenCalled();
      });
    });

    it('should apply overrides and shades', () => {
      // Assemble
      store.patchState({
        extractedVariables: [{ name: '--example-color', value: 'red' }],
        cssForm: new FormBuilder().group({
          extractedVariables: [{ name: '--example-color', value: 'red' }],
          overrides: ['{"--example-color": "--custom-color"}'],
          addShades: [true],
        }),
      });

      // Act
      store.applyOverrides();

      // Assert
      store.state$.subscribe((state) => {
        expect(state.customVariables).toEqual([
          { name: '--custom-color', value: 'red' },
        ]);
        expect(storeService.applyOverrides).toHaveBeenCalled();
        expect(colorService.generateColorScale).toHaveBeenCalled();
      });
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
    store.patchState({
      customVariables: [{ name: '--example-color', value: 'red' }],
    });

    // Act
    store.copyToClipboard(of(undefined));

    // Assert
    expect(clipboardWriteTextMock).toHaveBeenCalledWith(
      JSON.stringify([{ name: '--example-color', value: 'red' }], null, 2),
    );
  });

  describe('export', () => {
    it('should not export if no form', () => {
      // Assemble
      store.setState({} as unknown as ExtractorState);

      // Act
      store.export(of(undefined));

      // Assert
      store.state$.subscribe((state) => {
        expect(state.activeStep).toBe(0); // TODO: What should this actually do?
      });
    });

    it('should export a single file', () => {
      // Assemble
      store.patchState({
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
      store.export(of(undefined));

      // Assert
      expect(storeService.convertToCssVariables).not.toHaveBeenCalled();
      expect(storeService.applyOverrides).not.toHaveBeenCalled();
      expect(colorService.generateColorScale).not.toHaveBeenCalled();
      expect(storeService.saveJsonToFile).toHaveBeenCalledTimes(1);
    });

    it('should export all items to a single file', () => {
      // Assemble
      store.patchState({
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
        }),
        jsonItemCount: 2,
        currentItemIndex: 0,
      });

      // Act
      store.export(of(undefined));

      // Assert
      expect(storeService.convertToCssVariables).toHaveBeenCalledTimes(2);
      expect(storeService.applyOverrides).not.toHaveBeenCalled();
      expect(colorService.generateColorScale).not.toHaveBeenCalled();
      expect(storeService.saveJsonToFile).toHaveBeenCalledTimes(1);
    });

    it('should export all items to a single file and apply overrides', () => {
      // Assemble
      store.patchState({
        cssForm: new FormBuilder().group({
          jsonInput: [
            [
              { id: 1, name: 'Example 1', css: 'body { color: red; }' },
              { id: 2, name: 'Example 2', css: 'body { color: blue; }' },
            ],
          ],
          mergeDuplicates: [true],
          overrideVariableNames: [true],
          xpath: ['css'],
          overrides: ['{"--body-color": "--custom-color"}'],
        }),
        jsonItemCount: 2,
        currentItemIndex: 0,
      });

      // Act
      store.export(of(undefined));

      // Assert
      expect(storeService.convertToCssVariables).toHaveBeenCalledTimes(2);
      expect(storeService.applyOverrides).toHaveBeenCalledTimes(2);
      expect(colorService.generateColorScale).not.toHaveBeenCalled();
      expect(storeService.saveJsonToFile).toHaveBeenCalledTimes(1);
    });

    it('should export all items to a single file and add shares', () => {
      // Assemble
      store.patchState({
        cssForm: new FormBuilder().group({
          jsonInput: [
            [
              { id: 1, name: 'Example 1', css: 'body { color: red; }' },
              { id: 2, name: 'Example 2', css: 'body { color: blue; }' },
            ],
          ],
          mergeDuplicates: [true],
          overrideVariableNames: [true],
          addShades: [true],
          xpath: ['css'],
          overrides: ['{"--body-color": "--custom-color"}'],
        }),
        jsonItemCount: 2,
        currentItemIndex: 0,
      });

      // Act
      store.export(of(undefined));

      // Assert
      expect(storeService.convertToCssVariables).toHaveBeenCalledTimes(2);
      expect(storeService.applyOverrides).toHaveBeenCalledTimes(2);
      expect(colorService.generateColorScale).toHaveBeenCalledTimes(2);
      expect(storeService.saveJsonToFile).toHaveBeenCalledTimes(1);
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
    store.handleFileInput(of(event));

    // Assert
    store.state$.subscribe((state) => {
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
    store.handleFileInput(of(event));

    // Assert
    store.state$.subscribe((state) => {
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
    store.handleFileInput(of(event));

    // Assert
    store.state$.subscribe((state) => {
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
    store.handleFileInput(of(event));

    // Assert
    store.state$.subscribe((state) => {
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
    store.handleFileInput(of(event));

    // Assert
    store.state$.subscribe((state) => {
      expect(state.cssForm?.get('jsonInput')?.value).toEqual('');
      expect(state.jsonItemCount).toBe(0);
      done();
    });
  });
});
