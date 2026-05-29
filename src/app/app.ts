import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav }      from '../components/nav/nav';
import { Hero }     from '../components/hero/hero';
import { Gallery }  from '../components/gallery/gallery';
import { Services } from './services/services';
import { About }    from '../components/about/about';
import { Contact }  from '../components/contact/contact';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Nav, Hero, Gallery, Services, About, Contact],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sweetieNailsBakeryPortfolio');
}