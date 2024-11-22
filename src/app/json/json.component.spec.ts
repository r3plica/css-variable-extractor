import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CssVariableExtractorStore } from '@store';
import {
  FormErrorComponent,
  JsonViewerComponent,
  OverridesComponent,
  ResultsComponent,
  StepperComponent,
  VariablesComponent,
} from '@components';

import { JsonComponent } from './json.component';

describe('JsonComponent', () => {
  let component: JsonComponent;
  let fixture: ComponentFixture<JsonComponent>;
  let store: CssVariableExtractorStore;
  let formBuilder: FormBuilder;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormErrorComponent,
        VariablesComponent,
        ResultsComponent,
        StepperComponent,
        JsonViewerComponent,
        JsonComponent,
      ],
      providers: [CssVariableExtractorStore],
    }).compileComponents();

    fixture = TestBed.createComponent(JsonComponent);
    component = fixture.componentInstance;
    store = component['_store'];
    formBuilder = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should call clearInput on init', () => {
    // Assemble
    const clearSpy = jest.spyOn(store, 'clearInput');

    // Act
    component.ngOnInit();

    // Assert
    expect(clearSpy).toHaveBeenCalled();
  });

  it('should call parseCss when parseCss is invoked', () => {
    // Assemble
    const parseSpy = jest.spyOn(store, 'parseCss');

    // Act
    component.parseCss();

    // Assert
    expect(parseSpy).toHaveBeenCalled();
  });

  it('should call clearInput when clearInput is invoked', () => {
    // Assemble
    const clearSpy = jest.spyOn(store, 'clearInput');

    // Act
    component.clearInput();

    // Assert
    expect(clearSpy).toHaveBeenCalled();
  });

  it('should call handleFileInput when handleFileInput is invoked', () => {
    // Assemble
    const fileInputSpy = jest.spyOn(store, 'handleFileInput');

    // Act
    const event = new Event('change');
    component.handleFileInput(event);

    // Assert
    expect(fileInputSpy).toHaveBeenCalledWith(event);
  });

  it('should display the stepper component', () => {
    // Act
    fixture.detectChanges();
    const stepper = fixture.debugElement.query(By.directive(StepperComponent));

    // Assert
    expect(stepper).not.toBeNull();
  });

  it('should display the variables component', () => {
    store.setState((state) => ({
      ...state,
      activeStep: 1,
      cssForm: formBuilder.group({ overrideVariableNames: [false] }),
    }));
    fixture.detectChanges();
    const variables = fixture.debugElement.query(
      By.directive(VariablesComponent),
    );
    expect(variables).not.toBeNull();
  });

  it('should display the overrides component', () => {
    store.setState((state) => ({
      ...state,
      activeStep: 1,
      cssForm: formBuilder.group({
        overrideVariableNames: [true],
        overrides: [''],
      }),
    }));
    fixture.detectChanges();
    const overrides = fixture.debugElement.query(
      By.directive(OverridesComponent),
    );
    expect(overrides).not.toBeNull();
  });

  it('should display the results component', () => {
    // Assemble
    store.setState((state) => ({ ...state, activeStep: 2 }));

    // Act
    fixture.detectChanges();
    const results = fixture.debugElement.query(By.directive(ResultsComponent));

    // Assert
    expect(results).not.toBeNull();
  });

  it('should display the json viewer component', () => {
    // Act
    fixture.detectChanges();
    const jsonViewer = fixture.debugElement.query(
      By.directive(JsonViewerComponent),
    );

    // Assert
    expect(jsonViewer).not.toBeNull();
  });
});
