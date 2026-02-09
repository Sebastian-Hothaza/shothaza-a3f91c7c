import { Component, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass } from '@angular/common';
import { AuthService } from './auth';

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
    <div class="min-h-screen bg-gray-100 flex flex-col">

      <!-- Top bar -->
      <header class="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">Tasks</h1>

        <button
          class="text-sm text-gray-600 hover:text-red-600"
          (click)="logout()"
        >
          Logout
        </button>
      </header>

      <!-- Main content -->
      <main class="flex-1 p-6 max-w-3xl mx-auto w-full">

        @if (groupedTasks().length) {
          @for (group of groupedTasks(); track group[0]) {
            <section class="mb-8">
              <h2 class="text-lg font-semibold mb-3">
                {{ group[0] }}
              </h2>

              <ul class="space-y-2">
                @for (task of group[1]; track task.id) {
                  <li
                    class="bg-white rounded shadow-sm px-4 py-2 flex items-center justify-between"
                  >
                    <!-- Left: checkbox + title -->
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        [checked]="task.completed"
                        (change)="toggleCompleted(task)"
                        class="h-4 w-4"
                      />


                      <span
                        [ngClass]="{
                          'line-through text-gray-400': task.completed
                        }"
                      >
                        {{ task.title }}
                      </span>
                    </div>

                    <!-- Right: actions -->
                    <div class="flex gap-2">
                      <button
                        class="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        class="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                }
              </ul>
            </section>
          }
        } @else {
          <div class="text-center text-gray-500">
            Loading tasks...
          </div>
        }
      </main>

      <!-- Create task button -->
      <footer class="p-6 flex justify-center">
        <button
          class="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
        >
          + Create Task
        </button>
      </footer>

    </div>
  `,
})
export class DashboardComponent {
  private http = inject(HttpClient);

  private API_URL = 'http://10.0.0.4:3001/api/tasks';
  private authService = inject(AuthService);


  tasks = signal<Task[]>([]);

  groupedTasks = computed(() => {
    const groups: Record<string, Task[]> = {};

    for (const task of this.tasks()) {
      groups[task.category] ??= [];
      groups[task.category].push(task);
    }

    return Object.entries(groups);
  });

  toggleCompleted(task: Task) {
    const updated = { ...task, completed: !task.completed };

    // optimistic update
    this.tasks.set(
      this.tasks().map(t =>
        t.id === task.id ? updated : t
      ),
    );

    this.http
      .put(`${this.API_URL}/${task.id}`, { completed: updated.completed }, {
        withCredentials: true,
      })
      .subscribe({
        error: () => {
          // rollback on failure
          this.tasks.set(
            this.tasks().map(t =>
              t.id === task.id ? task : t
            ),
          );
        },
      });
  }


  logout() {
    this.authService.logout().subscribe();
  }

  constructor() {
    this.http
      .get<Task[]>(this.API_URL, { withCredentials: true })
      .subscribe((tasks) => this.tasks.set(tasks));
  }
}
