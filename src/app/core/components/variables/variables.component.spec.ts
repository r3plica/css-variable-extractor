import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { CssVariableStoreService } from '@store/css-variable-extractor.store';

import { VariablesComponent } from './variables.component';

describe('VariablesComponent', () => {
  let component: VariablesComponent;
  let fixture: ComponentFixture<VariablesComponent>;
  let store: CssVariableStoreService;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, VariablesComponent],
      providers: [
        {
          provide: CssVariableStoreService,
          useValue: {
            viewModel$: of({
              extractedVariables: [{ name: 'color', value: 'red' }],
              exportForm: new FormGroup({
                'export-0': new FormControl(true),
                'name-0': new FormControl('color'),
              }),
            }),
            exportVariables: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VariablesComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(CssVariableStoreService);
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should display the correct variable names', () => {
    // Act
    fixture.detectChanges();
    const variableNameInput = fixture.debugElement.query(
      By.css('input[type="text"]'),
    ).nativeElement;

    // Assert
    expect(variableNameInput.value).toBe('color');
  });

  it('should call exportVariables when the form is submitted', () => {
    // Act
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();

    // Assert
    expect(store.exportVariables).toHaveBeenCalled();
  });

  it('should display the correct checkbox state', () => {
    // Act
    fixture.detectChanges();
    const checkbox = fixture.debugElement.query(
      By.css('input[type="checkbox"]'),
    ).nativeElement;

    // Assert
    expect(checkbox.checked).toBe(true);
  });

  it('should update the variable name when the input value changes', () => {
    // Act
    const variableNameInput = fixture.debugElement.query(
      By.css('input[type="text"]'),
    ).nativeElement;
    variableNameInput.value = 'background-color';
    variableNameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Assert
    expect(store.viewModel$.value.extractedVariables[0].name).toBe(
      'background-color',
    );
  });
});
