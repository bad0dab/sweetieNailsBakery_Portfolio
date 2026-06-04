import {
  Component, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone, AfterViewInit, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements AfterViewInit {
  submitted   = false;
  sending     = false;
  error       = false;
  errorMsg    = '';
  countdown   = 0;
  currentYear = new Date().getFullYear();

  name    = '';
  service = '';
  message = '';

  email       = signal('');
  emailLocked = signal(false);

  private SERVICE_ID         = 'service_l8ums9n';
  private TEMPLATE_ID_NOTIFY = 'template_g82rvur';
  private PUBLIC_KEY         = 'DeVcUcw3keRhgO2t3';

  private GOOGLE_CLIENT_ID   = '55988937584-v6pvh0vaagqbcf1clki9211rs5q85nhf.apps.googleusercontent.com';

  private countdownTimer: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadGoogle();
  }


  private loadGoogle() {
    if ((window as any).google?.accounts?.id) {
      this.initGoogle();
      return;
    }
    if (document.getElementById('google-gsi')) {
      const wait = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(wait);
          this.initGoogle();
        }
      }, 150);
      return;
    }
    const s = document.createElement('script');
    s.id    = 'google-gsi';
    s.src   = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => this.initGoogle();
    document.body.appendChild(s);
  }

  private initGoogle() {
    if (!(window as any).google?.accounts?.id) return;
    google.accounts.id.initialize({
      client_id: this.GOOGLE_CLIENT_ID,
      callback: (resp: any) => this.handleCredential(resp),
      auto_select: false,
    });
    const target = document.getElementById('google-signin');
    if (target) {
      google.accounts.id.renderButton(target, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
      });
    }
    google.accounts.id.prompt();
  }

  private handleCredential(resp: any) {
    try {
      const base64Url = resp.credential.split('.')[1];
      const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json      = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json);

      this.zone.run(() => {
        this.email.set(payload.email || '');
        this.name = this.name || payload.name || '';
        this.emailLocked.set(!!payload.email);
        this.error    = false;
        this.errorMsg = '';
        this.cdr.detectChanges();
      });
    } catch (err) {
      console.error('Google credential parse error:', err);
    }
  }


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


  private resetForm() {
    this.name    = '';
    this.service = '';
    this.message = '';
    this.error   = false;
    this.errorMsg = '';
    if (!this.emailLocked()) {
      this.email.set('');
    }
  }

  private startCountdown(seconds: number) {
    this.countdown = seconds;

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.countdownTimer = setInterval(() => {
      this.zone.run(() => {
        this.countdown -= 1;

        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
          this.submitted = false;
          this.resetForm();
        }

        this.cdr.detectChanges();
      });
    }, 1000);
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;

    this.error    = false;
    this.errorMsg = '';

    const email = this.email();

    if (!this.name.trim() || !email.trim() || !this.service || !this.message.trim()) {
      this.errorMsg = 'Please fill in all fields before sending.';
      this.error    = true;
      return;
    }

    if (!this.isValidEmailFormat(email)) {
      this.errorMsg = 'Please enter a valid email address.';
      this.error    = true;
      return;
    }

    this.sending = true;
    this.cdr.detectChanges();

    if (!this.emailLocked()) {
      const exists = await this.emailExists(email);
      if (!exists) {
        this.zone.run(() => {
          this.errorMsg = 'That email address doesn\'t appear to exist. Please double-check it.';
          this.error    = true;
          this.sending  = false;
          this.cdr.detectChanges();
        });
        return;
      }
    }

    try {
      const emailjs = await import('@emailjs/browser');
      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID_NOTIFY,
        {
          from_name:  this.name,
          from_email: email,
          service:    this.service,
          message:    this.message,
        },
        { publicKey: this.PUBLIC_KEY }
      );
      this.zone.run(() => {
        this.submitted = true;
        this.sending   = false;
        this.cdr.detectChanges();
        this.startCountdown(3);
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