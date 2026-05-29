import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
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