<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'has_camera',
        'has_raspi',
        'camera_status', // 'online', 'offline', 'none'
        'ai_status',     // 'active', 'inactive', 'none'
        'ai_model_version',
        'location_lat',
        'location_lng',
        'status',        // 'aman', 'waspada', 'bahaya'
        'last_active_at',
    ];

    protected $casts = [
        'has_camera' => 'boolean',
        'has_raspi' => 'boolean',
        'location_lat' => 'double',
        'location_lng' => 'double',
        'last_active_at' => 'datetime',
    ];

    public function fireLogs()
    {
        return $this->hasMany(FireLog::class);
    }
}
