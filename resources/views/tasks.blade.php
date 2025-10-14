<x-layouts.app>
    <p>
        <a href="/" class="underline text-blue-500" wire:navigate>Back to home</a>
    </p>

    <div x-data="tasks">
        <div>
            <h2 class="font-bold">Urgent and Important (Do now)</h2>

            <ul>
                <template x-for="task in urgentAndImportantTasks">
                    <li x-text="task"></li>
                </template>
            </ul>
        </div>

        <div>
            <h2 class="font-bold">Not Urgent but Important (Plan/Schedule)</h2>

            <ul>
                <template x-for="task in notUrgentButImportantTasks">
                    <li x-text="task"></li>
                </template>
            </ul>
        </div>

        <div>
            <h2 class="font-bold">Urgent but Not Important (Delegate)</h2>

            <ul>
                <template x-for="task in urgentButNotImportantTasks">
                    <li x-text="task"></li>
                </template>
            </ul>
        </div>

        <div>
            <h2 class="font-bold">Not Urgent NOR Important (Delete)</h2>

            <ul>
                <template x-for="task in notUrgentNorImportantTasks">
                    <li x-text="task"></li>
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
            }));
        });
    </script>
</x-layouts.app>
