import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services {
  services = [
    { icon: '✦', name: 'Gel Extensions', desc: 'Custom-shaped gel extensions built for longevity and beauty. Perfect for special occasions or everyday elegance.', duration: '90 min', price: 'From €85' },
    { icon: '✿', name: 'Nail Art Design', desc: 'Hand-painted floral, abstract, and seasonal designs. Each nail a tiny canvas, each set a unique story.', duration: '60 min', price: 'From €55' },
    { icon: '❀', name: 'Soft Gel Overlay', desc: 'Strengthen your natural nails with a soft gel overlay in your choice of sheer, tinted, or french finish.', duration: '75 min', price: 'From €65' },
    { icon: '◇', name: 'Nail Infills', desc: 'Refresh and maintain your existing set. Includes shape correction, cuticle care, and a colour refresh.', duration: '60 min', price: 'From €45' },
  ];
}