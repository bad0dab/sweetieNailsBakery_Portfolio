import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare const emailjs: any;

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

  private SERVICE_ID  = 'service_l8ums9n';
  private TEMPLATE_ID = 'DeVcUcw3keRhgO2t3';

  name    = '';
  email   = '';
  service = '';
  message = '';

  async onSubmit(e: Event) {
    e.preventDefault();
    this.sending = true;
    this.error   = false;

    try {
      await emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, {
        from_name:  this.name,
        from_email: this.email,
        service:    this.service,
        message:    this.message,
      });
      this.submitted = true;
    } catch (err) {
      console.error(err);
      this.error = true;
    } finally {
      this.sending = false;
    }
  }
}