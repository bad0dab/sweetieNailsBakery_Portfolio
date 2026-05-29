import { Component } from '@angular/core';

interface NailSet {
  id: number; label: string; style: string;
  color: string; emoji: string; tag: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class Gallery {
  activeFilter = 'All';
  filters = ['All', 'Soft Glam', 'Floral', 'Abstract', 'Minimalist'];

  sets: NailSet[] = [
    { id: 1, label: 'Example 1', style: 'Soft Glam',  color: 'linear-gradient(135deg,#fde8f0,#f7c0d8)', emoji: '🌸', tag: 'Soft Glam' },
    { id: 2, label: 'Example 2', style: 'Floral',     color: 'linear-gradient(135deg,#f7c0d8,#e8a4b8)', emoji: '🌺', tag: 'Floral' },
    { id: 3, label: 'Example 3', style: 'Minimalist', color: 'linear-gradient(135deg,#e8d8f8,#d4b8f0)', emoji: '🤍', tag: 'Minimalist' },
    { id: 4, label: 'Example 4', style: 'Floral',     color: 'linear-gradient(135deg,#f0b8d0,#e89ab8)', emoji: '🌷', tag: 'Floral' },
  ];

  get filtered(): NailSet[] {
    return this.activeFilter === 'All' ? this.sets : this.sets.filter(s => s.tag === this.activeFilter);
  }
}