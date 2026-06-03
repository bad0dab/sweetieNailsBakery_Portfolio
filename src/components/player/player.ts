import { Component, Inject, PLATFORM_ID, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Track {
  title: string;
  artist: string;
  videoId: string;
}

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [],
  templateUrl: './player.html',
  styleUrl: './player.css'
})
export class Player implements OnDestroy {
  minimized    = false;
  playing      = false;
  ready        = false;
  volume       = 70;
  progress     = 0;
  currentIndex = 0;

  posX = 24;
  posY = 24;        
  private dragging  = false;
  private moved     = false;
  private startMx   = 0;
  private startMy   = 0;
  private startX    = 0;
  private startY    = 0;

  tracks: Track[] = [
    { title: 'Toxic - Cover',   artist: 'Melanie Martinez', videoId: 'gPxcNl-iCUs' },
    { title: 'Sugar crash (Slowed + Reverb)',   artist: 'ElyOtto', videoId: 'D1jx4cCJUA8' },
    { title: 'Genesis', artist: 'Grimes', videoId: 'WizNXQGBMEk' },
    { title: 'Mistake', artist: 'Overgrown', videoId: 'siM68TMIDEI' },
    { title: 'Play Date', artist: 'Melanie Martinez', videoId: 'kknKs7cAcO8' }
  ];

  private player: any = null;
  private progressTimer: any = null;

  private moveHandler = (e: MouseEvent | TouchEvent) => this.onDragMove(e);
  private upHandler   = ()  => this.onDragEnd();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadApi();
    }
  }

  get current(): Track {
    return this.tracks[this.currentIndex];
  }

  onDragStart(e: MouseEvent | TouchEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    const point = 'touches' in e ? e.touches[0] : e;
    this.dragging = true;
    this.moved    = false;
    this.startMx  = point.clientX;
    this.startMy  = point.clientY;
    this.startX   = this.posX;
    this.startY   = this.posY;
    this.zone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.moveHandler);
      window.addEventListener('mouseup',   this.upHandler);
      window.addEventListener('touchmove', this.moveHandler, { passive: false });
      window.addEventListener('touchend',  this.upHandler);
    });
  }

  private onDragMove(e: MouseEvent | TouchEvent) {
    if (!this.dragging) return;
    if ('touches' in e) e.preventDefault();          
    const point = 'touches' in e ? e.touches[0] : e;
    const dx = point.clientX - this.startMx;
    const dy = point.clientY - this.startMy;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.moved = true;

    let nx = this.startX + dx;
    let ny = this.startY - dy;

    const maxX = window.innerWidth  - 60;
    const maxY = window.innerHeight - 60;
    nx = Math.max(0, Math.min(nx, maxX));
    ny = Math.max(0, Math.min(ny, maxY));

    this.zone.run(() => {
      this.posX = nx;
      this.posY = ny;
      this.cdr.detectChanges();
    });
  }

  private onDragEnd() {
    this.dragging = false;
    window.removeEventListener('mousemove', this.moveHandler);
    window.removeEventListener('mouseup',   this.upHandler);
    window.removeEventListener('touchmove', this.moveHandler);
    window.removeEventListener('touchend',  this.upHandler);
  }

  private loadApi() {
    if (window.YT && window.YT.Player) { this.createPlayer(); return; }
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id  = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      this.createPlayer();
    };
  }

  private createPlayer() {
    this.player = new window.YT.Player('yt-player', {
      videoId: this.current.videoId,
      playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: (e: any) => {
          e.target.setVolume(this.volume);
          this.zone.run(() => { this.ready = true; this.cdr.detectChanges(); });
        },
        onStateChange: (e: any) => {
          const S = window.YT.PlayerState;
          this.zone.run(() => {
            if (e.data === S.PLAYING) { this.playing = true;  this.startProgressTimer(); }
            else if (e.data === S.PAUSED) { this.playing = false; this.stopProgressTimer(); }
            else if (e.data === S.ENDED)  { this.next(); }
            this.cdr.detectChanges();
          });
        }
      }
    });
  }

  togglePlay() {
    if (!this.player) return;
    this.playing ? this.player.pauseVideo() : this.player.playVideo();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.tracks.length;
    this.player?.loadVideoById(this.current.videoId);
  }

  prev() {
    if (this.player?.getCurrentTime && this.player.getCurrentTime() > 3) {
      this.player.seekTo(0, true);
      return;
    }
    this.currentIndex = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    this.player?.loadVideoById(this.current.videoId);
  }

  setVolume(e: Event) {
    this.volume = +(e.target as HTMLInputElement).value;
    this.player?.setVolume(this.volume);
  }

  seek(e: MouseEvent) {
    if (this.moved) return;           
    if (!this.player?.getDuration) return;
    const dur = this.player.getDuration();
    if (!dur) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.player.seekTo(((e.clientX - rect.left) / rect.width) * dur, true);
  }

  toggleMinimize() {
    if (this.moved) return;            
    this.minimized = !this.minimized;
  }

  private startProgressTimer() {
    this.stopProgressTimer();
    this.progressTimer = setInterval(() => {
      if (!this.player?.getDuration) return;
      const dur = this.player.getDuration();
      const cur = this.player.getCurrentTime();
      this.zone.run(() => {
        this.progress = dur ? (cur / dur) * 100 : 0;
        this.cdr.detectChanges();
      });
    }, 500);
  }

  private stopProgressTimer() {
    if (this.progressTimer) { clearInterval(this.progressTimer); this.progressTimer = null; }
  }

  ngOnDestroy() {
    this.stopProgressTimer();
    this.onDragEnd();
    this.player?.destroy?.();
  }
}