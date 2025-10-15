<x-layouts.app>
    <p>
        <a href="/" class="text-blue-500 underline" wire:navigate>
            Back to home
        </a>
    </p>

    <div x-data="tasks">
        <div class="my-4">
            <h2 class="font-bold">Urgent and Important (Do now)</h2>

            <ul>
                <template
                    x-for="(task, index) in urgentAndImportantTasks"
                    :key="index"
                >
                    <li>
                        <span x-text="task"></span>
                        <button
                            @click="deleteTaskAfterConfirmation()"
                            class="cursor-pointer text-sm text-red-500 underline"
                        >
                            Delete
                        </button>
                    </li>
                </template>
            </ul>
        </div>

        <div class="my-4">
            <h2 class="font-bold">Not Urgent but Important (Plan/Schedule)</h2>

            <ul>
                <template
                    x-for="(task, index) in notUrgentButImportantTasks"
                    :key="index"
                >
                    <li>
                        <span x-text="task"></span>
                        <button
                            @click="deleteTaskAfterConfirmation()"
                            class="cursor-pointer text-sm text-red-500 underline"
                        >
                            Delete
                        </button>
                    </li>
                </template>
            </ul>
        </div>

        <div class="my-4">
            <h2 class="font-bold">Urgent but Not Important (Delegate)</h2>

            <ul>
                <template
                    x-for="(task, index) in urgentButNotImportantTasks"
                    :key="index"
                >
                    <li>
                        <span x-text="task"></span>
                        <button
                            @click="deleteTaskAfterConfirmation()"
                            class="cursor-pointer text-sm text-red-500 underline"
                        >
                            Delete
                        </button>
                    </li>
                </template>
            </ul>
        </div>

        <div class="my-4">
            <div class="flex">
                <h2 class="font-bold">Not Urgent NOR Important (Delete)</h2>
                <button class="cursor-pointer font-bold text-red-500 underline">
                    Remove all distractions
                </button>
            </div>

            <ul>
                <template
                    x-for="(task, index) in notUrgentNorImportantTasks"
                    :key="index"
                >
                    <li>
                        <span x-text="task"></span>
                        <button
                            @click="deleteTaskAfterConfirmation()"
                            class="cursor-pointer text-sm text-red-500 underline"
                        >
                            Delete
                        </button>
                    </li>
                </template>
            </ul>
        </div>
    </div>

    <script>
        document.addEventListener("alpine:init", () => {
            Alpine.data("tasks", () => ({
                urgentAndImportantTasks: ["Task 1", "Task 2", "Task 3"],
                notUrgentButImportantTasks: ["Task 1", "Task 2", "Task 3"],
                urgentButNotImportantTasks: ["Task 1", "Task 2", "Task 3"],
                notUrgentNorImportantTasks: ["Task 1", "Task 2", "Task 3"],

                deleteAllNotUrgentNorImportantTasks() {
                    alert("Deleting all not urgent or important tasks...");
                },
            }));
        });
    </script>
</x-layouts.app>
