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
  submitted   = false;
  sending     = false;
  error       = false;
  errorMsg    = '';
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

  private isValidEmailFormat(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  private async emailExists(email: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://api.disify.com/api/email/${encodeURIComponent(email.trim())}`
      );
      if (!res.ok) return true;
      const data = await res.json();
      return data.format === true && data.dns === true;
    } catch {
      return true;
    }
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;

    this.error    = false;
    this.errorMsg = '';

    if (!this.name.trim() || !this.email.trim() || !this.service || !this.message.trim()) {
      this.errorMsg = 'Please fill in all fields before sending.';
      this.error    = true;
      return;
    }

    if (!this.isValidEmailFormat(this.email)) {
      this.errorMsg = 'Please enter a valid email address.';
      this.error    = true;
      return;
    }

    this.sending = true;
    this.cdr.detectChanges();

    const exists = await this.emailExists(this.email);
    if (!exists) {
      this.zone.run(() => {
        this.errorMsg = 'That email address doesn\'t appear to exist. Please double-check it.';
        this.error    = true;
        this.sending  = false;
        this.cdr.detectChanges();
      });
      return;
    }

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
        this.errorMsg = 'Something went wrong. Please try again or DM on Instagram.';
        this.error    = true;
        this.sending  = false;
        this.cdr.detectChanges();
      });
    }
  }
}