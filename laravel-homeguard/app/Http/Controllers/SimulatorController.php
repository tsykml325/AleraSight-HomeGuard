<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\FireLog;
use Illuminate\Http\Request;

class SimulatorController extends Controller
{
    public function trigger(Request $request)
    {
        $request->validate([
            'device_id' => 'required|exists:devices,id',
            'status' => 'required|in:aman,waspada,bahaya',
            'confidence_score' => 'required|numeric|min:0|max:100',
            'alarm_source' => 'required|in:sensor,ai_vision,combination',
        ]);

        $device = Device::findOrFail($request->device_id);
        
        // Map status to FireLog status text
        $logStatus = 'Tidak Terdeteksi';
        if ($request->status === 'waspada') {
            $logStatus = 'Potensi Api';
        } elseif ($request->status === 'bahaya') {
            $logStatus = 'Api Terdeteksi';
        }

        // Update Device Status
        $device->update([
            'status' => $request->status,
            'last_active_at' => now(),
        ]);

        // Define snapshot URL based on status for beautiful visual demo
        $snapshotUrl = null;
        if ($request->status === 'bahaya') {
            $snapshotUrl = 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=600&auto=format&fit=crop&q=60'; // Fire scene
        } elseif ($request->status === 'waspada') {
            $snapshotUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=60'; // Kitchen / Warm room scene
        } else {
            $snapshotUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=60'; // Normal room
        }

        // Create Fire Log Entry
        FireLog::create([
            'device_id' => $device->id,
            'status' => $logStatus,
            'confidence_score' => $request->confidence_score,
            'snapshot_url' => $snapshotUrl,
            'ai_status' => $device->ai_status === 'active' ? 'ACTIVE' : 'INACTIVE',
            'alarm_source' => $request->alarm_source,
            'alarm_duration' => $request->status === 'bahaya' ? 120 : ($request->status === 'waspada' ? 45 : 0),
            'telegram_notified_at' => $request->status !== 'aman' ? now() : null,
        ]);

        return redirect()->route('dashboard')->with('success', "Simulasi berhasil! Perangkat '{$device->name}' telah diperbarui ke status " . strtoupper($request->status) . ".");
    }

    public function resetAll()
    {
        // Reset all devices to safe 'aman' status
        Device::query()->update([
            'status' => 'aman',
            'last_active_at' => now(),
        ]);

        // Add a clearing log
        $devices = Device::all();
        foreach ($devices as $device) {
            FireLog::create([
                'device_id' => $device->id,
                'status' => 'Tidak Terdeteksi',
                'confidence_score' => 12.15,
                'snapshot_url' => null,
                'ai_status' => $device->ai_status === 'active' ? 'ACTIVE' : 'INACTIVE',
                'alarm_source' => 'sensor',
                'alarm_duration' => 0,
                'telegram_notified_at' => null,
            ]);
        }

        return redirect()->route('dashboard')->with('success', 'Semua perangkat dan alarm berhasil di-reset ke kondisi AMAN.');
    }
}
