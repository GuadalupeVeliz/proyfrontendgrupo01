import { Component } from '@angular/core';
import { LucideLogOut, LucideMap, LucideUser} from '@lucide/angular';

@Component({
  selector: 'app-header',
  imports: [LucideLogOut, LucideMap,LucideUser],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
