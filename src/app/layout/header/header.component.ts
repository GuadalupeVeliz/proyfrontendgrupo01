import { Component } from '@angular/core';
import { LucideLogOut, LucideMap, LucideUser, LucidePackageOpen, LucidePlane, LucideReceiptText, LucideUsers, LucideChartColumn } from '@lucide/angular';

@Component({
  selector: 'app-header',
  imports: [LucideLogOut, LucideMap, LucideUser, LucidePackageOpen, LucidePlane, LucideReceiptText, LucideUsers, LucideChartColumn],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
