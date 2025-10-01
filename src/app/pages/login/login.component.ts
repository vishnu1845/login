
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMsg = '';
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const email = this.email?.value;
    const password = this.password?.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        
        if (response && response.data) {
          this.authService.saveUserData(response.data);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMsg = 'User does not exist'
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.loading = false;
        
        if (error.error && error.error.message) {
          this.errorMsg = error.error.message;
        } else if (error.status === 0) {
          this.errorMsg = 'Network error. Please check your connection.';
        } else {
          this.errorMsg = 'Invalid email or password. Please try again.';
        }
      }
    });
  }

  onForgotPassword(event: Event): void {
    event.preventDefault(); // stops the browser from refreshing
    // Navigate or open a modal
    this.router.navigate(['/forgot-password']);
  }

}