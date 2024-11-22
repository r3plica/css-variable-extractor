import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CssVariableExtractorStore } from '@store';
import {
  OverridesComponent,
  ResultsComponent,
  StepperComponent,
  VariablesComponent,
} from '@components';

import { CssComponent } from './css.component';

describe('CssComponent', () => {
  let component: CssComponent;
  let fixture: ComponentFixture<CssComponent>;
  let store: CssVariableExtractorStore;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        VariablesComponent,
        ResultsComponent,
        StepperComponent,
        CssComponent,
      ],
      providers: [CssVariableExtractorStore],
    }).compileComponents();

    fixture = TestBed.createComponent(CssComponent);
    component = fixture.componentInstance;
    store = component['_store'];
    formBuilder = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('should create', () => {
    const compiled = fixture.nativeElement;
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should call clearInput and setStep on init', () => {
    const clearSpy = jest.spyOn(store, 'clearInput');
    const setStepSpy = jest.spyOn(store, 'setStep');

    component.ngOnInit();

    expect(clearSpy).toHaveBeenCalled();
    expect(setStepSpy).toHaveBeenCalledWith(0);
  });

  it('should call setStep on setStep method', () => {
    const setStepSpy = jest.spyOn(store, 'setStep');

    component.setStep(1);

    expect(setStepSpy).toHaveBeenCalledWith(1);
  });

  it('should call parseCss when parseCss is invoked', () => {
    const parseSpy = jest.spyOn(store, 'parseCss');

    component.parseCss();

    expect(parseSpy).toHaveBeenCalled();
  });

  it('should call clearInput when clearInput is invoked', () => {
    const clearSpy = jest.spyOn(store, 'clearInput');

    component.clearInput();

    expect(clearSpy).toHaveBeenCalled();
  });

  it('should display the stepper component', () => {
    fixture.detectChanges();
    const stepper = fixture.debugElement.query(By.directive(StepperComponent));
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
    store.setState((state) => ({ ...state, activeStep: 2 }));
    fixture.detectChanges();
    const results = fixture.debugElement.query(By.directive(ResultsComponent));
    expect(results).not.toBeNull();
  });
});
