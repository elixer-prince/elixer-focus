<x-layouts.app>
    <x-slot name="pageTitle">Welcome to Elixer Focus</x-slot>
    <x-slot name="pageDescription">Welcome to Elixer Focus</x-slot>

    <header>
        <h1 class="font-bold">Elixer Focus</h1>

        <ul>
            <li>
                <a class="text-blue-500" href="/tasks" wire:navigate>Tasks</a>
            </li>
            <li>
                <a class="text-blue-500" href="/settings" wire:navigate>Settings</a>
            </li>
        </ul>
    </header>

    <x-countdown-timer />

    <x-music-playlist />
</x-layouts.app>
