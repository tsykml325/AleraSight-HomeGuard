<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Device;
use App\Models\FireLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Default Users (Admin & Operator)
        User::create([
            'name' => 'Administrator AleraSight',
            'email' => 'admin@homeguard.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '+6281234567890',
        ]);

        User::create([
            'name' => 'Operator Lapangan',
            'email' => 'operator@homeguard.com',
            'password' => Hash::make('password123'),
            'role' => 'operator',
            'phone' => '+6281298765432',
        ]);

        // 2. Create Default Devices (Sensors, Cameras, Combo)
        $dev1 = Device::create([
            'name' => 'HomeGuard Node 01 - Ruang Tamu',
            'type' => 'combo',
            'has_camera' => true,
            'has_raspi' => true,
            'camera_status' => 'online',
            'ai_status' => 'active',
            'ai_model_version' => 'YOLOv8n-Fire_v2.1',
            'location_lat' => -6.2008,
            'location_lng' => 106.8166,
            'status' => 'aman',
            'last_active_at' => now(),
        ]);

        $dev2 = Device::create([
            'name' => 'HomeGuard Node 02 - Dapur Utama',
            'type' => 'combo',
            'has_camera' => true,
            'has_raspi' => true,
            'camera_status' => 'online',
            'ai_status' => 'active',
            'ai_model_version' => 'YOLOv8n-Fire_v2.1',
            'location_lat' => -6.2030,
            'location_lng' => 106.8190,
            'status' => 'bahaya',
            'last_active_at' => now(),
        ]);

        $dev3 = Device::create([
            'name' => 'HomeGuard Node 03 - Server Room',
            'type' => 'sensor',
            'has_camera' => false,
            'has_raspi' => false,
            'camera_status' => 'none',
            'ai_status' => 'none',
            'ai_model_version' => 'N/A',
            'location_lat' => -6.1985,
            'location_lng' => 106.8120,
            'status' => 'waspada',
            'last_active_at' => now(),
        ]);

        $dev4 = Device::create([
            'name' => 'HomeGuard Node 04 - Garasi Mobil',
            'type' => 'camera',
            'has_camera' => true,
            'has_raspi' => true,
            'camera_status' => 'offline',
            'ai_status' => 'inactive',
            'ai_model_version' => 'YOLOv8n-Fire_v2.1',
            'location_lat' => -6.2015,
            'location_lng' => 106.8150,
            'status' => 'aman',
            'last_active_at' => now()->subHours(2),
        ]);

        // 3. Create Sample Fire Logs
        FireLog::create([
            'device_id' => $dev1->id,
            'status' => 'Tidak Terdeteksi',
            'confidence_score' => 12.15,
            'snapshot_url' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=60',
            'ai_status' => 'ACTIVE',
            'alarm_source' => 'sensor',
            'alarm_duration' => 0,
            'telegram_notified_at' => null,
            'created_at' => now()->subHours(5),
        ]);

        FireLog::create([
            'device_id' => $dev2->id,
            'status' => 'Api Terdeteksi',
            'confidence_score' => 98.42,
            'snapshot_url' => 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=600&auto=format&fit=crop&q=60',
            'ai_status' => 'ACTIVE',
            'alarm_source' => 'combination',
            'alarm_duration' => 180,
            'telegram_notified_at' => now()->subMinutes(12),
            'created_at' => now()->subMinutes(15),
        ]);

        FireLog::create([
            'device_id' => $dev3->id,
            'status' => 'Potensi Api',
            'confidence_score' => 64.20,
            'snapshot_url' => null,
            'ai_status' => 'INACTIVE',
            'alarm_source' => 'sensor',
            'alarm_duration' => 45,
            'telegram_notified_at' => now()->subMinutes(5),
            'created_at' => now()->subMinutes(8),
        ]);
    }
}
