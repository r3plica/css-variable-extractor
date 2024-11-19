import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
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
      providers: [CssVariableStoreService],
    }).compileComponents();

    fixture = TestBed.createComponent(VariablesComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(CssVariableStoreService);
    fixture.detectChanges();
  });

  beforeEach(() => {
    store.setState((state) => ({
      ...state,
      extractedVariables: [{ name: 'color', value: 'red' }],
      exportForm: new FormGroup({
        'export-0': new FormControl(true),
        'name-0': new FormControl('color'),
      }),
    }));
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
    // Assemble
    const exportVariablesSpy = jest.spyOn(store, 'exportVariables');

    // Act
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.submit();

    // Assert
    expect(exportVariablesSpy).toHaveBeenCalled();
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

  it('should update the variable name when the input value changes', (done) => {
    // Act
    fixture.detectChanges();
    const variableNameInput = fixture.debugElement.query(
      By.css('input[type="text"]'),
    ).nativeElement;
    variableNameInput.value = 'background-color';
    variableNameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Assert
    store.state$.subscribe((state) => {
      expect(state.extractedVariables[0].name).toBe('background-color');
      done();
    });
  });
});
