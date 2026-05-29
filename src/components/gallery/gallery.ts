import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NailSet {
  id: number;
  label: string;
  style: string;
  color: string;
  emoji: string;
  tag: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery {
  activeFilter = 'All';
  filters = ['All', 'Soft Glam', 'Floral', 'Abstract', 'Minimalist'];

  sets: NailSet[] = [
    { id: 1, label: 'Example 1', style: 'Soft Glam', color: '#f7c5d0', emoji: '🌸', tag: 'Soft Glam' },
    { id: 2, label: 'Example 2', style: 'Floral', color: '#f2b8c6', emoji: '🌺', tag: 'Floral' },
    { id: 3, label: 'Example 3', style: 'Minimalist', color: '#fde8dc', emoji: '🤍', tag: 'Minimalist' },
    { id: 4, label: 'Example 4', style: 'Floral', color: '#e8a4b8', emoji: '🌷', tag: 'Floral' },
  ];

  get filtered(): NailSet[] {
    if (this.activeFilter === 'All') return this.sets;
    return this.sets.filter(s => s.tag === this.activeFilter);
  }

  trackById(_: number, item: NailSet) { return item.id; }
}