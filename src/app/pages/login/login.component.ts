import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleAuthService } from '../../auth/google-auth.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [NgOptimizedImage],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit {

  @ViewChild('googleBtn') googleBtn!: ElementRef<HTMLElement>;

  constructor(private googleAuth: GoogleAuthService) { }
  
  ngAfterViewInit(): void {
    this.googleAuth.initGoogleButton(this.googleBtn.nativeElement);
  }

}
