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
                    @click="showInputForAddingUrgentAndImportantTasks()"
                    class="cursor-pointer font-bold text-blue-500 underline"
                >
                    Add Task
                </button>
            </div>

            <div>
                <template x-if="urgentAndImportantInputShown">
                    <input
                        @keydown.enter="addUrgentAndImportantTask()"
                        type="text"
                        class="border"
                    />
                </template>

                <template x-if="urgentAndImportantTasks.length === 0">
                    <p>You have no tasks in this quadrant...</p>
                </template>
            </div>

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
                        @click="showInputForAddingNotUrgentButImportantTasks()"
                        class="cursor-pointer font-bold text-blue-500 underline"
                    >
                        Add Task
                    </button>
                </div>
            </div>

            <div>
                <template x-if="notUrgentButImportantInputShown">
                    <input
                        @keydown.enter="addNotUrgentButImportantTask()"
                        type="text"
                        class="border"
                    />
                </template>

                <template x-if="notUrgentButImportantTasks.length === 0">
                    <p>You have no tasks in this quadrant...</p>
                </template>
            </div>

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
                        @click="showInputForAddingUrgentButNotImportantTasks()"
                        class="cursor-pointer font-bold text-blue-500 underline"
                    >
                        Add Task
                    </button>
                </div>
            </div>

            <div>
                <template x-if="urgentButNotImportantInputShown">
                    <input
                        @keydown.enter="addUrgentButNotImportantTask()"
                        type="text"
                        class="border"
                    />
                </template>

                <template x-if="urgentButNotImportantTasks.length === 0">
                    <p>You have no tasks in this quadrant...</p>
                </template>
            </div>

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
                        @click="showInputForAddingNotUrgentNorImportantTasks()"
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

            <div>
                <template x-if="notUrgentNorImportantInputShown">
                    <input
                        @keydown.enter="addNotUrgentNorImportantTask()"
                        type="text"
                        class="border"
                    />
                </template>

                <template x-if="notUrgentNorImportantTasks.length === 0">
                    <p>You have no tasks in this quadrant...</p>
                </template>
            </div>

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
                urgentAndImportantInputShown: false,
                notUrgentButImportantTasks:
                    JSON.parse(
                        localStorage.getItem('notUrgentButImportantTasks'),
                    ) || [],
                notUrgentButImportantInputShown: false,
                urgentButNotImportantTasks:
                    JSON.parse(
                        localStorage.getItem('urgentButNotImportantTasks'),
                    ) || [],
                urgentButNotImportantInputShown: false,
                notUrgentNorImportantTasks:
                    JSON.parse(
                        localStorage.getItem('notUrgentNorImportantTasks'),
                    ) || [],
                notUrgentNorImportantInputShown: false,

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

                showInputForAddingUrgentAndImportantTasks() {
                    this.urgentAndImportantInputShown = true;
                },

                showInputForAddingNotUrgentButImportantTasks() {
                    this.notUrgentButImportantInputShown = true;
                },

                showInputForAddingUrgentButNotImportantTasks() {
                    this.urgentButNotImportantInputShown = true;
                },

                showInputForAddingNotUrgentNorImportantTasks() {
                    this.notUrgentNorImportantInputShown = true;
                },

                addUrgentAndImportantTask() {
                    if (this.$el.value.trim() !== '') {
                        this.urgentAndImportantTasks.unshift(this.$el.value);
                        this.$el.value = '';
                        this.urgentAndImportantInputShown = false;
                    }
                },

                addNotUrgentButImportantTask() {
                    if (this.$el.value.trim() !== '') {
                        this.notUrgentButImportantTasks.unshift(this.$el.value);
                        this.$el.value = '';
                        this.notUrgentButImportantInputShown = false;
                    }
                },

                addUrgentButNotImportantTask() {
                    if (this.$el.value.trim() !== '') {
                        this.urgentButNotImportantTasks.unshift(this.$el.value);
                        this.$el.value = '';
                        this.urgentButNotImportantInputShown = false;
                    }
                },

                addNotUrgentNorImportantTask() {
                    if (this.$el.value.trim() !== '') {
                        this.notUrgentNorImportantTasks.unshift(this.$el.value);
                        this.$el.value = '';
                        this.notUrgentNorImportantInputShown = false;
                    }
                },

                deleteTaskAfterConfirmation(category, index) {
                    if (confirm('Are you sure you want to delete this task?')) {
                        this[category].splice(index, 1);
                    }
                },

                deleteAllNotUrgentNorImportantTasks() {
                    if (this.notUrgentNorImportantTasks.length === 0)
                        return alert(
                            'Good job! You have no tasks in this quadrant! 😊',
                        );

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
