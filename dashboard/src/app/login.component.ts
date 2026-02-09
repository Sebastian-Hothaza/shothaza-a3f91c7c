import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow">
      <h1 class="text-2xl font-bold mb-6 text-center">
        Task Dashboard Login
      </h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            formControlName="email"
            class="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            formControlName="password"
            class="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="password"
          />
        </div>

        <button
          type="submit"
          [disabled]="form.invalid"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Log in
        </button>
      </form>
    </div>
  </div>
`,

})
export class LoginComponent {
  form;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  onSubmit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    console.log('Login submit:', email, password);

    // Next step: call AuthService.login(...)
  }
}
