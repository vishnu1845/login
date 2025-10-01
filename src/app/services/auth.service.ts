
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginPayload {
  email: string;
  phone: string;
  phoneCode: string;
  password: string;
  deviceToken: string;
  deviceType: string;
  deviceModel: string;
  appVersion: string;
  osVersion: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://dev-api.wanasti.com/api/v1/user/login?lang=en&currencyCode=KW';
  
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'auth': 'dAwMpo/TAWLhFrwwr3Wzcmc8XTdmAgp6zmGLsFmJ9HAnEbTQAg937i/hqKFjtFVQ4TnQ2y6xlVSeTKy3VWcxvalwvmPq6qF7+UcLd3wBXYoVQ2Puj49mTweKh/v2Rvj9zyVjfbexFkjMNZ5XyGucmdOI6XMmI98Zvu38Jh1fOo8157YxlgCozKkonixczjGIn3RKLuv7v3gXDRl4irzRcS6lYKGJB8vfA847GUppsVjdZV9bAjADfqUP2Iyl6Nz8MOWrSHNy8tWqhM6mI165rCwH3xMv7HEexmsMO7Mi36c=s'
  });

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<ApiResponse> {
    // FIXED: Added proper values for device fields instead of empty strings
    const payload: LoginPayload = {
      email: email,
      phone: '',
      phoneCode: '965',
      password: password,
      deviceToken: this.generateDeviceToken(),
      deviceType: 'web',
      deviceModel: this.getDeviceModel(),
      appVersion: '1.0.0',
      osVersion: this.getOSVersion()
    };

    console.log('Login payload:', payload); // Debug log

    return this.http.post<ApiResponse>(this.apiUrl, payload, { headers: this.headers }).pipe(
      tap((response: ApiResponse) => {
        console.log('Login response:', response); // Debug log
        if (response && response.data) {
          this.saveUserData(response.data);
        }
      })
    );
  }

  // Generate a unique device token for web
  private generateDeviceToken(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `web_${timestamp}_${random}`;
  }

  // Get device model from user agent
  private getDeviceModel(): string {
    const ua = navigator.userAgent;
    // Extract browser name
    let browser = 'Unknown';
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    return browser;
  }

  // Get OS version from platform
  private getOSVersion(): string {
    const platform = navigator.platform;
    const ua = navigator.userAgent;
    
    if (platform.indexOf('Win') > -1) return 'Windows';
    if (platform.indexOf('Mac') > -1) return 'MacOS';
    if (platform.indexOf('Linux') > -1) return 'Linux';
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    
    return platform;
  }

  isLoggedIn(): boolean {
    return !!this.getUserData();
  }

  getUserData(): any {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  saveUserData(data: any): void {
    try {
      localStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  updateUserProfile(updatedData: any): void {
    const currentData = this.getUserData();
    if (currentData) {
      const newData = { ...currentData, ...updatedData };
      this.saveUserData(newData);
    }
  }

  logout(): void {
    localStorage.removeItem('userData');
  }

  deleteAccount(): void {
    localStorage.clear();
  }

  // Get user avatar with fallback
  getUserAvatar(): string {
    const user = this.getUserData();
    return user?.image || user?.profileImage || 'assets/default-avatar.png';
  }

  // Get user full name
  getUserFullName(): string {
    const user = this.getUserData();
    const firstName = user?.firstName || 'User';
    const lastName = user?.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }
}