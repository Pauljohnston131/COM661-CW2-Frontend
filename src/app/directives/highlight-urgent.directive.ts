import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appHighlightUrgent]',
  standalone: true
})
export class HighlightUrgentDirective implements OnChanges {

  @Input() appHighlightUrgent: boolean = false;

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    if (this.appHighlightUrgent) {
      this.el.nativeElement.style.borderLeft = '6px solid #dc3545';
      this.el.nativeElement.style.backgroundColor = '#fff5f5';
      this.el.nativeElement.style.paddingLeft = '10px';
    } else {
      this.el.nativeElement.style.borderLeft = 'none';
      this.el.nativeElement.style.backgroundColor = 'inherit';
    }
  }
}
