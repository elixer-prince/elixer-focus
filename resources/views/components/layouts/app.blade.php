<!DOCTYPE html>

<html
    lang="{{ str_replace("_", "-", app()->getLocale()) }}"
    class="not-motion-reduce:scroll-smooth"
>
    <head>
        <meta charset="utf-8" />
        <meta name="author" content="Elixer Prince (Daniel J. Leith)" />
        <meta
            name="description"
            content="{{ $pageDescription ?? "Page description..." }}"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{ $pageTitle ?? config("app.name") }}</title>
        <link
            rel="icon"
            href="{{ Vite::asset("resources/assets/images/elixerfocus-favicon.png") }}"
        />
        @vite(["resources/css/app.css", "resources/js/app.js"])
    </head>

    <body>
        {{ $slot }}

        @livewireScripts()
    </body>
</html>
