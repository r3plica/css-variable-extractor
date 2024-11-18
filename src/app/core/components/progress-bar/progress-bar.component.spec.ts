import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';
import { By } from '@angular/platform-browser';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    component.maxValue = 100;
    component.currentValue = 50;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should display the correct progress', () => {
    // Act
    fixture.detectChanges();
    const progressBar = fixture.debugElement.query(
      By.css('#progressBar')
    ).nativeElement;

    // Assert
    expect(progressBar.style.width).toBe('50%');
  });

  it('should display the correct text', () => {
    // Act
    fixture.detectChanges();
    const textElement = fixture.debugElement.query(
      By.css('#progressText')
    ).nativeElement;

    // Assert
    expect(textElement.textContent).toContain('50 / 100');
  });

  it('should update the progress when currentValue changes', () => {
    // Act
    component.currentValue = 75;
    fixture.detectChanges();
    const progressBar = fixture.debugElement.query(
      By.css('#progressBar')
    ).nativeElement;

    // Assert
    expect(progressBar.style.width).toBe('75%');
  });

  it('should update the text when currentValue changes', () => {
    // Act
    component.currentValue = 75;
    fixture.detectChanges();
    const textElement = fixture.debugElement.query(
      By.css('#progressText')
    ).nativeElement;

    // Assert
    expect(textElement.textContent).toContain('75 / 100');
  });
});
