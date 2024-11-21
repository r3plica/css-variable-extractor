import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const compiled = fixture.nativeElement;
    expect(component).toBeTruthy();
    expect(compiled).toBeTruthy();
  });

  it('should display the current year', () => {
    fixture.detectChanges();
    const yearElement = fixture.debugElement.query(
      By.css('.text-sm'),
    ).nativeElement;
    expect(yearElement.textContent).toContain(
      new Date().getFullYear().toString(),
    );
  });

  it('should display the correct copyright text', () => {
    fixture.detectChanges();
    const copyrightElement = fixture.debugElement.query(
      By.css('.text-sm'),
    ).nativeElement;
    expect(copyrightElement.textContent).toContain('Copyright ©');
    expect(copyrightElement.textContent).toContain('r3plica Ltd');
  });

  it('should have a link to r3plica Ltd', () => {
    fixture.detectChanges();
    const linkElement = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(linkElement.href).toContain(
      'https://www.r3plica.co.uk/?ref=na-footer',
    );
  });
});
