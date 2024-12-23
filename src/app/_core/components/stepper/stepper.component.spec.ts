import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { CssVariableExtractorStore } from '@store';

import { StepperComponent } from './stepper.component';

describe('StepperComponent', () => {
  let component: StepperComponent;
  let fixture: ComponentFixture<StepperComponent>;
  let store: CssVariableExtractorStore;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperComponent],
      providers: [
        {
          provide: CssVariableExtractorStore,
          useValue: {
            viewModel$: of({
              activeStep: 1,
              currentItemIndex: 0,
              jsonItemCount: 3,
            }),
            setStep: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(CssVariableExtractorStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should display the correct step titles', () => {
    // Act
    fixture.detectChanges();
    const stepTitles = fixture.debugElement.queryAll(By.css('.step'));

    // Assert
    expect(stepTitles.length).toBe(3);
    expect(stepTitles[0].nativeElement.textContent).toContain(
      'Step 1: CSS input',
    );
    expect(stepTitles[1].nativeElement.textContent).toContain(
      'Step 2: Variables to extract',
    );
    expect(stepTitles[2].nativeElement.textContent).toContain(
      'Step 3: Results',
    );
  });

  it('should call setStep when a step is clicked', () => {
    // Act
    const stepElement = fixture.debugElement.query(
      By.css('#step-1'),
    ).nativeElement;
    stepElement.click();

    // Assert
    expect(store.setStep).toHaveBeenCalledWith(0);
  });
});
