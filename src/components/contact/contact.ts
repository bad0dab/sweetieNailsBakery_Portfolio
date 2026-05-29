import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  submitted = false;
  currentYear = new Date().getFullYear();

  onSubmit(e: Event) {
    e.preventDefault();
    this.submitted = true;
  }
}