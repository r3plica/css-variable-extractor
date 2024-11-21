import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Act
    const compiled = fixture.nativeElement;

    // Assert
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should display the current year', () => {
    // Act
    fixture.detectChanges();
    const yearElement = fixture.debugElement.query(
      By.css('.text-sm'),
    ).nativeElement;

    // Assert
    expect(yearElement.textContent).toContain(
      new Date().getFullYear().toString(),
    );
  });

  it('should display the correct copyright text', () => {
    // Act
    fixture.detectChanges();
    const copyrightElement = fixture.debugElement.query(
      By.css('.text-sm'),
    ).nativeElement;

    // Assert
    expect(copyrightElement.textContent).toContain('Notus Angular by');
    expect(copyrightElement.textContent).toContain('Creative Tim');
  });

  it('should have a link to Creative Tim', () => {
    // Act
    fixture.detectChanges();
    const linkElement = fixture.debugElement.query(By.css('a')).nativeElement;

    // Assert
    expect(linkElement.href).toContain(
      'https://www.creative-tim.com/?ref=na-footer',
    );
  });
});
