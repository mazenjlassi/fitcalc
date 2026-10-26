import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ad-slot',
  styleUrl: './ad-slot.scss',
  templateUrl: './ad-slot.html',
})
export class AdSlot {
  readonly enabled = input(false);
  readonly label = input('Advertisement');
}
