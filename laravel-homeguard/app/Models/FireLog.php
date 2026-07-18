<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FireLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'status',               // 'Tidak Terdeteksi', 'Potensi Api', 'Api Terdeteksi'
        'confidence_score',     // percentage, e.g. 98.42
        'snapshot_url',         // URL or path
        'ai_status',           // 'ACTIVE', 'INACTIVE'
        'alarm_source',         // 'sensor', 'ai_vision', 'combination'
        'alarm_duration',       // in seconds
        'telegram_notified_at',
    ];

    protected $casts = [
        'confidence_score' => 'float',
        'alarm_duration' => 'integer',
        'telegram_notified_at' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
