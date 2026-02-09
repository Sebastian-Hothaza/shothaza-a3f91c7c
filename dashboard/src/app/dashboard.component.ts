import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass } from '@angular/common';
import { inject } from '@angular/core';

interface Task {
  id: number;
  title: string;
  category: string;
  completed: boolean;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [NgClass],
  template: `
    <h2>Tasks</h2>
    @if (tasks().length) {
      <ul>
        @for (task of tasks(); track task.id) {
          <li [ngClass]="{ completed: task.completed }">
            {{ task.title }} - {{ task.category }}
          </li>
        }
      </ul>
    } @else {
      <div>Loading tasks...</div>
    }
  `
})

export class DashboardComponent {
  private http = inject(HttpClient);

  tasks = signal<Task[]>([]);

  private API_URL = 'http://10.0.0.4:3001/api/tasks';

  constructor() {
    this.http.get<Task[]>(this.API_URL, { withCredentials: true })
      .subscribe(tasks => this.tasks.set(tasks));
  }
}
