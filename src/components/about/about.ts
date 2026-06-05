import { Component, signal, Inject, PLATFORM_ID, OnDestroy, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About implements OnDestroy {
  private birthday = new Date(2007, 11, 13); 
  greetings = ['Hello', 'Hola', 'Ciao'];
  greeting = signal(this.greetings[0]);

  private index = 0;
  private timer: any = null;

  age = computed(() => this.calculateAge(this.birthday));

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.timer = setInterval(() => {
        this.index = (this.index + 1) % this.greetings.length;
        this.greeting.set(this.greetings[this.index]);
      }, 2200);
    }
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}