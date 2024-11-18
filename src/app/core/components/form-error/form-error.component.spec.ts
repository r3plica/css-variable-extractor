import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { FormErrorComponent } from './form-error.component';
import { By } from '@angular/platform-browser';

describe('FormErrorComponent', () => {
  let component: FormErrorComponent;
  let fixture: ComponentFixture<FormErrorComponent>;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormErrorComponent);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      testControl: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(10),
        Validators.pattern(/^[a-zA-Z]+$/),
      ]),
    });
    component.controlName = 'testControl';
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should display required error message', () => {
    // Act
    component.control?.markAsTouched();
    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(
      By.css('div')
    ).nativeElement;

    // Assert
    expect(errorElement.textContent).toContain('This field is required.');
  });

  it('should display minlength error message', () => {
    // Act
    component.control?.setValue('abc');
    component.control?.markAsTouched();
    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(
      By.css('div')
    ).nativeElement;

    // Assert
    expect(errorElement.textContent).toContain(
      'Must be at least 5 characters long.'
    );
  });

  it('should display maxlength error message', () => {
    // Act
    component.control?.setValue('abcdefghijk');
    component.control?.markAsTouched();
    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(
      By.css('div')
    ).nativeElement;

    // Assert
    expect(errorElement.textContent).toContain('Cannot exceed 10 characters.');
  });

  it('should display pattern error message', () => {
    // Act
    component.control?.setValue('12345');
    component.control?.markAsTouched();
    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(
      By.css('div')
    ).nativeElement;

    // Assert
    expect(errorElement.textContent).toContain('Invalid format.');
  });

  it('should display custom error message', () => {
    // Act
    component.control?.setErrors({ customError: 'Custom error message' });
    component.control?.markAsTouched();
    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(
      By.css('div')
    ).nativeElement;

    // Assert
    expect(errorElement.textContent).toContain('Custom error message');
  });
});
