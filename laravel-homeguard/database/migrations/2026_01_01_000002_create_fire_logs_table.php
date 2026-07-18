<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fire_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->string('status'); // 'Tidak Terdeteksi', 'Potensi Api', 'Api Terdeteksi'
            $table->decimal('confidence_score', 5, 2)->default(0.00); // 0.00 to 100.00
            $table->string('snapshot_url')->nullable();
            $table->string('ai_status')->default('ACTIVE'); // 'ACTIVE', 'INACTIVE'
            $table->string('alarm_source')->default('sensor'); // 'sensor', 'ai_vision', 'combination'
            $table->integer('alarm_duration')->default(0); // seconds
            $table->timestamp('telegram_notified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fire_logs');
    }
};
