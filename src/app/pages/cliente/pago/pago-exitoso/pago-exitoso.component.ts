import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-pago-exitoso',
  imports: [CommonModule, RouterLink],
  templateUrl: './pago-exitoso.component.html',
})
export class PagoExitosoComponent implements OnInit {
  paymentId: string | null = null;
  reservaId: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.queryParamMap.get('payment_id');
    this.reservaId = this.route.snapshot.queryParamMap.get('external_reference');
  }
}