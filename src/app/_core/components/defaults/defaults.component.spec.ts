import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { of } from 'rxjs';

import { CssVariableExtractorStore } from '@store';

import { DefaultsComponent } from './defaults.component';

describe('DefaultsComponent', () => {
  let component: DefaultsComponent;
  let store: CssVariableExtractorStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DefaultsComponent, ReactiveFormsModule],
      providers: [
        {
          provide: CssVariableExtractorStore,
          useValue: {
            viewModel$: of({
              defaultsForm: new FormGroup({
                'name-0': new FormControl('--primary-color'),
                'value-0': new FormControl('#ff0000'),
              }),
            }),
            applyDefaults: jest.fn(),
          },
        },
      ],
    });

    component = TestBed.createComponent(DefaultsComponent).componentInstance;
    store = TestBed.inject(CssVariableExtractorStore);
  });

  it('should create the component', () => {
    // Assemble & Act
    const instance =
      TestBed.createComponent(DefaultsComponent).componentInstance;

    // Assert
    expect(instance).toBeTruthy();
  });

  it('should return sorted control indexes', () => {
    // Assemble
    const form = new FormGroup({
      'name-1': new FormControl(''),
      'name-0': new FormControl(''),
      'value-2': new FormControl(''),
    });

    // Act
    const result = component.getControlIndexes(form);

    // Assert
    expect(result).toEqual([0, 1, 2]);
  });

  it('should call applyDefaults on the store', () => {
    // Assemble
    const applyDefaultsSpy = jest.spyOn(store, 'applyDefaults');

    // Act
    component.applyDefaults();

    // Assert
    expect(applyDefaultsSpy).toHaveBeenCalled();
  });

  it('should return variable value in var() format', () => {
    // Assemble
    const variableName = '--primary-color';

    // Act
    const result = component.getVariableValue(variableName);

    // Assert
    expect(result).toBe('var(--primary-color)');
  });
});
