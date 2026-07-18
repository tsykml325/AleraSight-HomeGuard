<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\FireLog;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Core Analytics Counters
        $totalDevices = Device::count();
        $activeFires = Device::where('status', 'bahaya')->count();
        $warnings = Device::where('status', 'waspada')->count();
        $safeDevices = Device::where('status', 'aman')->count();
        
        $avgConfidence = FireLog::avg('confidence_score') ?? 0;
        
        // 2. Fetch Latest Fire Logs (Snapshot, time, status, device)
        $latestLogs = FireLog::with('device')
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        // 3. Status Flags (Mock / Real aggregation)
        $telegramActive = true; // Bot dispatcher active
        $sirenActive = ($activeFires > 0); // Siren sounds if fire detected
        $aiVisionActive = Device::where('ai_status', 'active')->count() > 0;
        $raspiOnlineCount = Device::where('has_raspi', true)->where('camera_status', 'online')->count();

        // 4. List all devices for the Interactive Map (GIS)
        $gisDevices = Device::all();

        return view('dashboard', compact(
            'totalDevices', 'activeFires', 'warnings', 'safeDevices', 'avgConfidence',
            'latestLogs', 'telegramActive', 'sirenActive', 'aiVisionActive', 'raspiOnlineCount',
            'gisDevices'
        ));
    }
}
