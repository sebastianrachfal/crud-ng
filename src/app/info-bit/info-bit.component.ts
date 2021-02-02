import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-bit',
  templateUrl: './info-bit.component.html',
  styleUrls: ['./info-bit.component.scss'],
})
export class InfoBitComponent {
  @Input() name: string = '';
  @Input() value: any;
  @Input() showCoin: boolean = false;
}
