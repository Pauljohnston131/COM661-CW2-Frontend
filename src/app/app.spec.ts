import { TestBed, ComponentFixture } from '@angular/core/testing';

import { App } from './app';

describe('App (Root Component - isolated)', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: []  
    }).compileComponents();

   
    TestBed.overrideComponent(App, {
      set: {
        imports: [],     
        template: ''     
      }
    });

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the App root component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise the title signal correctly', () => {
    expect(component['title']()).toBe('COM661-CW2-Frontend');
  });
});

