import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  // Assemble
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NavbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
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

  it('should toggle navbarOpen when setNavbarOpen is called', () => {
    // Act
    component.setNavbarOpen();

    // Assert
    expect(component.navbarOpen).toBe(true);

    // Act
    component.setNavbarOpen();

    // Assert
    expect(component.navbarOpen).toBe(false);
  });

  it('should toggle navbarOpen when the button is clicked', () => {
    // Act
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
    fixture.detectChanges();

    // Assert
    expect(component.navbarOpen).toBe(true);

    // Act
    button.click();
    fixture.detectChanges();

    // Assert
    expect(component.navbarOpen).toBe(false);
  });

  it('should display the correct links', () => {
    // Act
    fixture.detectChanges();
    const links = fixture.debugElement.queryAll(By.css('a'));

    // Assert
    expect(links.length).toBe(4);
    expect(links[0].nativeElement.textContent).toContain(
      'Css Variable Extractor',
    );
    expect(links[1].nativeElement.textContent).toContain('CSS');
    expect(links[2].nativeElement.textContent).toContain('Json');
    expect(links[3].nativeElement.textContent).toContain('Shading');
  });
});
