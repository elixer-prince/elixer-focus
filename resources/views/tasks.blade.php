<x-layouts.app>
    <p>
        <a href="/" class="text-blue-500 underline" wire:navigate>
            Back to home
        </a>
    </p>

    <div x-data="tasks">
        <div class="my-4">
            <div class="flex">
                <h2 class="font-bold">Urgent and Important (Do now)</h2>
                <button
                    @click="addUrgentAndImportantTask()"
                    class="cursor-pointer font-bold text-blue-500 underline"
                >
                    Add Task
                </button>
            </div>

            <input
                @keydown.enter="addUrgentAndImportantTask()"
                type="text"
                class="border"
            />

            <ul>
                <template
                    x-for="(task, index) in urgentAndImportantTasks"
                    :key="index"
                >
                    <li>
                        <span x-text="task"></span>
                        <button
                            @click="deleteTaskAfterConfirmation('urgentAndImportantTasks', index)"
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
                <h2 class="font-bold">
                    Not Urgent but Important (Plan/Schedule)
                </h2>
                <div>
                    <button
                        @click="addNotUrgentButImportantTask()"
                        class="cursor-pointer font-bold text-blue-500 underline"
                    >
                        Add Task
                    </button>
                </div>
            </div>

            <input
                @keydown.enter="addNotUrgentButImportantTask()"
                type="text"
                class="border"
            />

            <ul>
                <template
                    x-for="(task, index) in notUrgentButImportantTasks"
                    :key="index"
                >
                    <li>
                        <span x-text="task"></span>
                        <button
                            @click="deleteTaskAfterConfirmation('notUrgentButImportantTasks', index)"
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
                <h2 class="font-bold">Urgent but Not Important (Delegate)</h2>
                <div>
                    <button
                        @click="addUrgentButNotImportantTask()"
                        class="cursor-pointer font-bold text-blue-500 underline"
                    >
                        Add Task
                    </button>
                </div>
            </div>

            <input
                @keydown.enter="addUrgentButNotImportantTask()"
                type="text"
                class="border"
            />

            <ul>
                <template
                    x-for="(task, index) in urgentButNotImportantTasks"
                    :key="index"
                >
                    <li>
                        <span x-text="task"></span>
                        <button
                            @click="deleteTaskAfterConfirmation('urgentButNotImportantTasks', index)"
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
                <div>
                    <button
                        @click="addNotUrgentNorImportantTask()"
                        class="cursor-pointer font-bold text-blue-500 underline"
                    >
                        Add Task
                    </button>
                    <button
                        @click="deleteAllNotUrgentNorImportantTasks()"
                        class="cursor-pointer font-bold text-red-500 underline"
                    >
                        Remove all distractions
                    </button>
                </div>
            </div>

            <input
                @keydown.enter="addNotUrgentNorImportantTask()"
                type="text"
                class="border"
            />

            <ul>
                <template
                    x-for="(task, index) in notUrgentNorImportantTasks"
                    :key="index"
                >
                    <li>
                        <span x-text="task"></span>
                        <button
                            @click="deleteTaskAfterConfirmation('notUrgentNorImportantTasks', index)"
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
        document.addEventListener('alpine:init', () => {
            Alpine.data('tasks', () => ({
                urgentAndImportantTasks:
                    JSON.parse(
                        localStorage.getItem('urgentAndImportantTasks'),
                    ) || [],
                notUrgentButImportantTasks:
                    JSON.parse(
                        localStorage.getItem('notUrgentButImportantTasks'),
                    ) || [],
                urgentButNotImportantTasks:
                    JSON.parse(
                        localStorage.getItem('urgentButNotImportantTasks'),
                    ) || [],
                notUrgentNorImportantTasks:
                    JSON.parse(
                        localStorage.getItem('notUrgentNorImportantTasks'),
                    ) || [],

                init() {
                    this.$watch('urgentAndImportantTasks', (value) => {
                        localStorage.setItem(
                            'urgentAndImportantTasks',
                            JSON.stringify(value),
                        );
                    });

                    this.$watch('notUrgentButImportantTasks', (value) => {
                        localStorage.setItem(
                            'notUrgentButImportantTasks',
                            JSON.stringify(value),
                        );
                    });

                    this.$watch('urgentButNotImportantTasks', (value) => {
                        localStorage.setItem(
                            'urgentButNotImportantTasks',
                            JSON.stringify(value),
                        );
                    });

                    this.$watch('notUrgentNorImportantTasks', (value) => {
                        localStorage.setItem(
                            'notUrgentNorImportantTasks',
                            JSON.stringify(value),
                        );
                    });
                },

                deleteAllNotUrgentNorImportantTasks() {
                    if (
                        confirm(
                            'Are you sure you want to delete all your distractions',
                        )
                    ) {
                        this.notUrgentNorImportantTasks = [];
                    }
                },
            }));
        });
    </script>
</x-layouts.app>
