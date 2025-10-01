
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any;
  profileForm: FormGroup;
  
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  saving = false;
  successMsg = '';
  errorMsg = '';
  
  selectedMenuItem = 'edit-profile';
  
  // Default avatar fallback
  defaultAvatar = 'assets/default-avatar.png';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneCode: ['965', Validators.required],
      phone: ['', Validators.required],
      oldPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.authService.getUserData();
    
    if (this.user) {
      this.profileForm.patchValue({
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
        phoneCode: this.user.phoneCode || '965',
        phone: this.user.phone || ''
      });
    }
  }

  // Get user avatar with fallback
  getUserAvatar(): string {
    return this.user?.image || this.user?.profileImage || this.defaultAvatar;
  }

  // Get full name
  getFullName(): string {
    const firstName = this.user?.firstName || 'User';
    const lastName = this.user?.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }

  // Handle avatar error
  onAvatarError(event: any): void {
    event.target.src = this.defaultAvatar;
  }

  // Select menu item
  selectMenuItem(item: string): void {
    this.selectedMenuItem = item;
    
    if (item === 'delete') {
      this.deleteAccount();
    }
  }

  toggleOldPassword(): void {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMsg = 'Please fill all required fields correctly.';
      this.clearMessagesAfterDelay();
      return;
    }

    const oldPassword = this.profileForm.get('oldPassword')?.value;
    const newPassword = this.profileForm.get('newPassword')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;

    if (oldPassword || newPassword || confirmPassword) {
      if (!oldPassword) {
        this.errorMsg = 'Please enter your old password.';
        this.clearMessagesAfterDelay();
        return;
      }
      if (!newPassword) {
        this.errorMsg = 'Please enter a new password.';
        this.clearMessagesAfterDelay();
        return;
      }
      if (newPassword !== confirmPassword) {
        this.errorMsg = 'New password and confirm password do not match.';
        this.clearMessagesAfterDelay();
        return;
      }
      if (newPassword.length < 6) {
        this.errorMsg = 'Password must be at least 6 characters long.';
        this.clearMessagesAfterDelay();
        return;
      }
    }

    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    setTimeout(() => {
      try {
        const updatedUser = {
          ...this.user,
          firstName: this.profileForm.get('firstName')?.value,
          lastName: this.profileForm.get('lastName')?.value,
          email: this.profileForm.get('email')?.value,
          phoneCode: this.profileForm.get('phoneCode')?.value,
          phone: this.profileForm.get('phone')?.value
        };

        this.authService.saveUserData(updatedUser);
        this.user = updatedUser;

        this.successMsg = 'Profile updated successfully!';
        this.saving = false;

        this.profileForm.patchValue({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        this.clearMessagesAfterDelay();

      } catch (error) {
        this.errorMsg = 'Failed to update profile. Please try again.';
        this.saving = false;
        this.clearMessagesAfterDelay();
      }
    }, 1000);
  }

  clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMsg = '';
      this.errorMsg = '';
    }, 4000);
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  deleteAccount(): void {
    const confirmation = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmation) {
      this.authService.deleteAccount();
      this.router.navigate(['/login']);
    }
  }

  // Avatar upload handler (optional feature)
  onAvatarUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.image = e.target.result;
        this.authService.saveUserData(this.user);
      };
      reader.readAsDataURL(file);
    }
  }
}