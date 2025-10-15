<x-layouts.app>
    <x-slot name="pageTitle">Welcome to Elixer Focus</x-slot>
    <x-slot name="pageDescription">Welcome to Elixer Focus</x-slot>

    <header>
        <h1 class="font-bold">Elixer Focus</h1>

        <div>
            <div>
                <a class="text-blue-500" href="/settings" wire:navigate>
                    Settings
                </a>
            </div>
        </div>
    </header>

    <x-countdown-timer />

    <x-music-playlist />
</x-layouts.app>
