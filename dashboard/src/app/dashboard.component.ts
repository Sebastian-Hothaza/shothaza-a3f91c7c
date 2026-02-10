import { Component, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NgClass } from "@angular/common";
import { AuthService } from "./auth";


interface Task {
  id: number;
  title: string;
  category: string;
  completed: boolean;
}

@Component({
  standalone: true,
  selector: "app-dashboard",
  imports: [NgClass],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col">
      <!-- Top bar -->
      <header
        class="bg-white shadow px-6 py-4 flex justify-between items-center"
      >
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
        @if (groupedTasks().length) { @for (group of groupedTasks(); track
        group[0]) {
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
                <button class="text-sm text-blue-600 hover:underline"
                (click)="showEditModal.set(true); workingTaskId = task.id">
                  
                  Edit
                </button>
                <button class="text-sm text-red-600 hover:underline"
                (click)="deleteTask(task.id)">
                  
                  Delete
                </button>
              </div>
            </li>
            }
          </ul>
        </section>
        } } @else {
        <div class="text-center text-gray-500">Loading tasks...</div>
        }
      </main>

      <!-- Create task button -->
      <footer class="p-6 flex justify-center">
        <button
          class="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
          (click)="showCreateModal.set(true)"
        >
          + Create Task
        </button>
      </footer>

      @if (showCreateModal()) {
      <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <h2 class="text-lg font-bold mb-4">Create Task</h2>

          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                class="mt-1 w-full border rounded px-3 py-2"
                placeholder="Task title"
                [value]="newTaskTitle()"
                (input)="newTaskTitle.set($any($event.target).value)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                class="mt-1 w-full border rounded px-3 py-2"
                placeholder="Work, Personal, etc."
                [value]="newTaskCategory()"
                (input)="newTaskCategory.set($any($event.target).value)"
              />
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <button
                type="button"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                [disabled]="creating() || !newTaskTitle().trim()"
                (click)="createTask()"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
      }
      @if (showEditModal()) {
      <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <h2 class="text-lg font-bold mb-4">Edit Task</h2>

          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                class="mt-1 w-full border rounded px-3 py-2"
                placeholder="Task title"
                [value]="editTaskTitle()"
                (input)="editTaskTitle.set($any($event.target).value)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                class="mt-1 w-full border rounded px-3 py-2"
                placeholder="Work, Personal, etc."
                [value]="editTaskCategory()"
                (input)="editTaskCategory.set($any($event.target).value)"
              />
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <button
                type="button"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                [disabled]="creating() || !editTaskTitle().trim()"
                (click)="editTask()"
              >
                Edit
              </button>
            </div>
          </form>
        </div>
      </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  private http = inject(HttpClient);

  private API_URL = "http://10.0.0.4:3001/api/tasks";
  private authService = inject(AuthService);

  showCreateModal = signal(false); // Toggle modal to create new tasks
  showEditModal = signal(false); // Toggle modal to edit existing tasks
  workingTaskId = 0; // Used to track what task we are currently editing

  // Form state signals
  newTaskTitle = signal("");
  newTaskCategory = signal("");
  editTaskTitle = signal("");
  editTaskCategory = signal("");
  creating = signal(false);

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
    this.tasks.set(this.tasks().map((t) => (t.id === task.id ? updated : t)));

    this.http
      .put(
        `${this.API_URL}/${task.id}`,
        { completed: updated.completed },
        {
          withCredentials: true,
        },
      )
      .subscribe({
        error: () => {
          // rollback on failure
          this.tasks.set(
            this.tasks().map((t) => (t.id === task.id ? task : t)),
          );
        },
      });
  }

  createTask() {
    const title = this.newTaskTitle().trim();
    const category = this.newTaskCategory().trim() || "Uncategorized";

    if (!title) return;

    this.creating.set(true);

    this.http
      .post<Task>(this.API_URL, { title, category }, { withCredentials: true })
      .subscribe({
        next: (task) => {
          // add task to UI
          this.tasks.set([...this.tasks(), task]);

          // reset modal state
          this.newTaskTitle.set("");
          this.newTaskCategory.set("");
          this.showCreateModal.set(false);
          this.creating.set(false);
        },
        error: () => {
          this.creating.set(false);
          alert("Failed to create task");
        },
      });
  }

  editTask() {
    const title = this.editTaskTitle().trim();
    const category = this.editTaskCategory().trim() || "Uncategorized";


    if (!title) return;

    this.creating.set(true);

    console.log(`editing task with id ${this.workingTaskId}`)
    this.http
      .put<Task>(this.API_URL + `/${this.workingTaskId}`, { title, category }, { withCredentials: true })
      .subscribe({
        next: (task) => {
          // add task to UI
          this.tasks.set([...this.tasks(), task]);

          // reset modal state
          this.editTaskTitle.set("");
          this.editTaskCategory.set("");
          this.showEditModal.set(false);
          this.creating.set(false);
        },
        error: () => {
          this.creating.set(false);
          alert("Failed to edit task");
        },
      });
    window.location.reload();
  }

  deleteTask(taskId: number) {
    this.http.delete(`${this.API_URL}/${taskId}`, { withCredentials: true })
    .subscribe({
      next: (task) => {
        // Remove task from UI
        this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
      },
      error: ()=> {
      alert('failed to delete task')
    }})
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
