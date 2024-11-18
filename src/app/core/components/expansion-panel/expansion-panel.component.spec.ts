import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpansionPanelComponent } from './expansion-panel.component';
import { By } from '@angular/platform-browser';

describe('ExpansionPanelComponent', () => {
  let component: ExpansionPanelComponent;
  let fixture: ComponentFixture<ExpansionPanelComponent>;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpansionPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpansionPanelComponent);
    component = fixture.componentInstance;
    component.title = 'Test Title';
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should toggle isOpen when toggle is called', () => {
    // Act
    component.toggle();

    // Assert
    expect(component.isOpen).toBe(true);

    // Act
    component.toggle();

    // Assert
    expect(component.isOpen).toBe(false);
  });

  it('should display the title', () => {
    // Act
    fixture.detectChanges();
    const titleElement = fixture.debugElement.query(
      By.css('button span')
    ).nativeElement;

    // Assert
    expect(titleElement.textContent).toContain('Test Title');
  });

  it('should toggle isOpen when the title is clicked', () => {
    // Act
    const titleElement = fixture.debugElement.query(
      By.css('button')
    ).nativeElement;
    titleElement.click();
    fixture.detectChanges();

    // Assert
    expect(component.isOpen).toBe(true);

    // Act
    titleElement.click();
    fixture.detectChanges();

    // Assert
    expect(component.isOpen).toBe(false);
  });
});
