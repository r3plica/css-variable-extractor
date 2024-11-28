/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let routerEvents$: Subject<any>;
  let mockRouter: Partial<Router>;

  beforeEach(() => {
    routerEvents$ = new Subject();
    mockRouter = {
      events: routerEvents$.asObservable(),
      navigate: jest.fn(),
      createUrlTree: jest.fn(),
      navigateByUrl: jest.fn(),
      serializeUrl: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should subscribe to router events and call smoothScrollToTop on NavigationEnd', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const smoothScrollToTopSpy = jest.spyOn(app as any, 'smoothScrollToTop');

    fixture.detectChanges();
    routerEvents$.next(new NavigationEnd(1, '/test', '/test'));

    expect(smoothScrollToTopSpy).toHaveBeenCalled();
  });

  it('should not call smoothScrollToTop for non-NavigationEnd events', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const smoothScrollToTopSpy = jest.spyOn(app as any, 'smoothScrollToTop');

    fixture.detectChanges();
    routerEvents$.next({ someEvent: 'NotNavigationEnd' });

    expect(smoothScrollToTopSpy).not.toHaveBeenCalled();
  });

  it('should unsubscribe from router events on ngOnDestroy', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    fixture.detectChanges();
    expect(app['routerEventsSubscription']).toBeTruthy();

    const unsubscribeSpy = jest.spyOn(
      app['routerEventsSubscription'],
      'unsubscribe',
    );
    fixture.destroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should smoothly scroll to the top of the page', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const scrollToSpy = jest
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => {});
    (app as any).smoothScrollToTop();

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });
});
