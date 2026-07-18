<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('sensor'); // 'sensor', 'camera', 'combo'
            $table->boolean('has_camera')->default(false);
            $table->boolean('has_raspi')->default(false);
            $table->string('camera_status')->default('none'); // 'online', 'offline', 'none'
            $table->string('ai_status')->default('none');     // 'active', 'inactive', 'none'
            $table->string('ai_model_version')->default('YOLOv8n-Fire_v2.1');
            $table->double('location_lat')->default(-6.2000);
            $table->double('location_lng')->default(106.8166);
            $table->string('status')->default('aman'); // 'aman', 'waspada', 'bahaya'
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
