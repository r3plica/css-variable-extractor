import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';

import { ColorService, InputParserService } from '@services';

import { ColorsComponentStore } from './colors.component.store';

describe('ColorsComponentStore', () => {
  let store: ColorsComponentStore;
  let colorService: ColorService;
  let inputParserService: InputParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        ColorsComponentStore,
        {
          provide: ColorService,
          useValue: {
            generateColorScale: jest.fn(),
          },
        },
        {
          provide: InputParserService,
          useValue: {
            parse: jest.fn(),
          },
        },
      ],
    });

    store = TestBed.inject(ColorsComponentStore);
    colorService = TestBed.inject(ColorService);
    inputParserService = TestBed.inject(InputParserService);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize the form', () => {
    store.state$.subscribe((state) => {
      expect(state.form).toBeTruthy();
      expect(state.form?.get('input')).toBeTruthy();
      expect(state.form?.get('output')).toBeTruthy();
    });
  });

  it('should set the active step', () => {
    store.setStep(1);
    store.state$.subscribe((state) => {
      expect(state.activeStep).toBe(1);
    });
  });

  it('should parse variables from JSON array format', () => {
    // Assemble
    const mockVariables = [{ name: '--primary', value: '#ff0000' }];
    const mockColorScale = [{ name: '--primary-050', value: '#ffcccc' }];
    jest.spyOn(inputParserService, 'parse').mockReturnValue(mockVariables);
    jest
      .spyOn(colorService, 'generateColorScale')
      .mockReturnValue(mockColorScale);

    store.patchState({
      form: new FormBuilder().group({
        input: [JSON.stringify(mockVariables), Validators.required],
        output: [''],
      }),
    });

    // Act
    store.parseVariables();

    // Assert
    store.state$.subscribe((state) => {
      expect(state.activeStep).toBe(1);
      expect(state.form?.get('output')?.value).toBe(
        JSON.stringify(mockColorScale, null, 2),
      );
    });
  });

  it('should parse variables from key-value format', () => {
    // Assemble
    const keyValueInput = 'tru-menu: #192a67, Tru-primary: #cd1719';
    const mockVariables = [
      { name: '--tru-menu', value: '#192a67' },
      { name: '--tru-primary', value: '#cd1719' },
    ];
    const mockColorScale = [
      { name: '--tru-menu-500', value: '#192a67' },
      { name: '--tru-primary-500', value: '#cd1719' },
    ];
    jest.spyOn(inputParserService, 'parse').mockReturnValue(mockVariables);
    jest
      .spyOn(colorService, 'generateColorScale')
      .mockReturnValue(mockColorScale);

    store.patchState({
      form: new FormBuilder().group({
        input: [keyValueInput, Validators.required],
        output: [''],
      }),
    });

    // Act
    store.parseVariables();

    // Assert
    store.state$.subscribe((state) => {
      expect(inputParserService.parse).toHaveBeenCalledWith(keyValueInput);
      expect(state.activeStep).toBe(1);
      expect(state.form?.get('output')?.value).toBe(
        JSON.stringify(mockColorScale, null, 2),
      );
    });
  });

  it('should parse variables from CSS variable format', () => {
    // Assemble
    const cssInput = '--tru-menu: #192a67; --tru-primary: #cd1719;';
    const mockVariables = [
      { name: '--tru-menu', value: '#192a67' },
      { name: '--tru-primary', value: '#cd1719' },
    ];
    const mockColorScale = [
      { name: '--tru-menu-500', value: '#192a67' },
      { name: '--tru-primary-500', value: '#cd1719' },
    ];
    jest.spyOn(inputParserService, 'parse').mockReturnValue(mockVariables);
    jest
      .spyOn(colorService, 'generateColorScale')
      .mockReturnValue(mockColorScale);

    store.patchState({
      form: new FormBuilder().group({
        input: [cssInput, Validators.required],
        output: [''],
      }),
    });

    // Act
    store.parseVariables();

    // Assert
    store.state$.subscribe((state) => {
      expect(inputParserService.parse).toHaveBeenCalledWith(cssInput);
      expect(state.activeStep).toBe(1);
    });
  });

  it('should handle invalid input that parses to empty array', () => {
    // Assemble
    jest.spyOn(inputParserService, 'parse').mockReturnValue([]);

    store.patchState({
      form: new FormBuilder().group({
        input: ['invalid-input', Validators.required],
        output: [''],
      }),
    });

    // Act
    store.parseVariables();

    // Assert
    store.state$.subscribe((state) => {
      expect(state.activeStep).toBe(0);
      expect(state.form?.get('output')?.value).toBe('');
    });
  });

  it('should not process when form is invalid', () => {
    // Assemble
    store.patchState({
      form: new FormBuilder().group({
        input: ['', Validators.required],
        output: [''],
      }),
    });

    // Act
    store.parseVariables();

    // Assert
    store.state$.subscribe((state) => {
      expect(state.activeStep).toBe(0);
    });
  });

  it('should copy to clipboard', () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
    });

    store.patchState({
      form: new FormBuilder().group({
        output: ['{"name":"primary","value":"#ff0000"}'],
      }),
    });

    store.copyToClipboard(of(undefined));

    expect(mockWriteText).toHaveBeenCalledWith(
      '"{\\"name\\":\\"primary\\",\\"value\\":\\"#ff0000\\"}"',
    );
  });

  it('should export to file', () => {
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

    store.patchState({
      form: new FormBuilder().group({
        output: ['{"name":"primary","value":"#ff0000"}'],
      }),
    });

    store.exportToFile(of(undefined));

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should clear input', () => {
    store.patchState({
      form: new FormBuilder().group({
        input: ['{"name":"primary","value":"#ff0000"}'],
        output: ['{"name":"primary","value":"#ff0000"}'],
      }),
    });

    store.clearInput();

    store.state$.subscribe((state) => {
      expect(state.activeStep).toBe(0);
      expect(state.form?.get('input')?.value).toBe('');
      expect(state.form?.get('output')?.value).toBe('');
    });
  });
});
