<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\FireLogController;
use Illuminate\Support\Facades\Route;

// Guest Routes
Route::get('/', function () {
    return redirect()->route('login');
});
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    // Dashboard (Accessible by Admin and Operator)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Devices CRUD (Admin: fully manage, Operator: view only)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/devices/create', [DeviceController::class, 'create'])->name('devices.create');
        Route::post('/devices', [DeviceController::class, 'store'])->name('devices.store');
        Route::get('/devices/{device}/edit', [DeviceController::class, 'edit'])->name('devices.edit');
        Route::put('/devices/{device}', [DeviceController::class, 'update'])->name('devices.update');
        Route::delete('/devices/{device}', [DeviceController::class, 'destroy'])->name('devices.destroy');
    });
    // Operator and Admin can view devices
    Route::get('/devices', [DeviceController::class, 'index'])->name('devices.index');

    // Raw Data & Fire Detections Logs (Admin & Operator)
    Route::get('/fire-detections', [FireLogController::class, 'index'])->name('fire-detections.index');

    // Reports & Analytics (Admin & Operator)
    Route::get('/reports', [FireLogController::class, 'reports'])->name('reports.index');

    // Settings (Admin only)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/settings', [FireLogController::class, 'showSettings'])->name('settings.index');
        Route::post('/settings', [FireLogController::class, 'updateSettings'])->name('settings.update');
    });
});
