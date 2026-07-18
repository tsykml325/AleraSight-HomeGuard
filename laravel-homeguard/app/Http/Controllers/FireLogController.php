<?php

namespace App\Http\Controllers;

use App\Models\FireLog;
use App\Models\Device;
use Illuminate\Http\Request;

class FireLogController extends Controller
{
    public function index(Request $request)
    {
        $query = FireLog::with('device');

        // Filter by Device
        if ($request->filled('device_id')) {
            $query->where('device_id', $request->device_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by alarm source
        if ($request->filled('alarm_source')) {
            $query->where('alarm_source', $request->alarm_source);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(12);
        $devices = Device::all();

        return view('fire-detections.index', compact('logs', 'devices'));
    }

    public function reports(Request $request)
    {
        $query = FireLog::with('device');

        // Date Range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        $reports = $query->orderBy('created_at', 'desc')->get();
        
        // Summary Calculations
        $totalAlarms = $reports->count();
        $avgConfidence = $reports->avg('confidence_score') ?? 0;
        $totalDuration = $reports->sum('alarm_duration');

        return view('reports.index', compact('reports', 'totalAlarms', 'avgConfidence', 'totalDuration'));
    }

    public function showSettings()
    {
        // Fetch or simulate system configurations
        $config = [
            'ai_threshold' => session('ai_threshold', 85.0),
            'camera_resolution' => session('camera_resolution', '1920x1080'),
            'snapshot_interval' => session('snapshot_interval', 10),
            'enable_ai_detection' => session('enable_ai_detection', true),
        ];

        return view('settings.index', compact('config'));
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'ai_threshold' => 'required|numeric|between:0,100',
            'camera_resolution' => 'required|string|in:1280x720,1920x1080,2560x1440',
            'snapshot_interval' => 'required|integer|min:1|max:300',
            'enable_ai_detection' => 'required|boolean',
        ]);

        session([
            'ai_threshold' => $validated['ai_threshold'],
            'camera_resolution' => $validated['camera_resolution'],
            'snapshot_interval' => $validated['snapshot_interval'],
            'enable_ai_detection' => $validated['enable_ai_detection'],
        ]);

        return redirect()->route('settings.index')->with('success', 'Konfigurasi deteksi AI Vision berhasil diperbarui.');
    }
}
