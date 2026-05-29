// FIX, USER MUST INSERT EVERYTHING INTO FORM IN ORDER TO SEND THE EMAIL, OTHERWISE IT WON'T WORK


import { Component, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  submitted = false;
  sending   = false;
  error     = false;
  currentYear = new Date().getFullYear();

  private SERVICE_ID         = 'service_l8ums9n';
  private TEMPLATE_ID_NOTIFY = 'template_g82rvur';
  private PUBLIC_KEY         = 'DeVcUcw3keRhgO2t3';

  name    = '';
  email   = '';
  service = '';
  message = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  async onSubmit(e: Event) {
    e.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;

    this.sending = true;
    this.error   = false;
    this.cdr.detectChanges();

    try {
      const emailjs = await import('@emailjs/browser');
      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID_NOTIFY,
        {
          from_name:  this.name,
          from_email: this.email,
          service:    this.service,
          message:    this.message,
        },
        { publicKey: this.PUBLIC_KEY }
      );
      this.zone.run(() => {
        this.submitted = true;
        this.sending   = false;
        this.cdr.detectChanges();
      });
    } catch (err: any) {
      console.error('EmailJS error:', err);
      this.zone.run(() => {
        this.error   = true;
        this.sending = false;
        this.cdr.detectChanges();
      });
    }
  }
}