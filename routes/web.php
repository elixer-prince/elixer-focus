<?php

use Illuminate\Support\Facades\Route;

Route::view("/", "index");

// TODO: Add Authentication Routes
Route::prefix("auth")->group(function () {
    // elixerfocus.com/auth/login
    // elixerfocus.com/auth/register
    // elixerfocus.com/auth/admin/login
});

// TODO: Add Settings Routes
Route::prefix("settings")->group(function () {
    Route::view("/", "settings");
    // elixerfocus.com/settings/timer
});
