<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index()
    {
        $devices = Device::orderBy('created_at', 'desc')->paginate(10);
        return view('devices.index', compact('devices'));
    }

    public function create()
    {
        return view('devices.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:sensor,camera,combo',
            'has_camera' => 'required|boolean',
            'has_raspi' => 'required|boolean',
            'camera_status' => 'required|string|in:online,offline,none',
            'ai_status' => 'required|string|in:active,inactive,none',
            'ai_model_version' => 'required|string|max:50',
            'location_lat' => 'required|numeric|between:-90,90',
            'location_lng' => 'required|numeric|between:-180,180',
            'status' => 'required|string|in:aman,waspada,bahaya',
        ]);

        $validated['last_active_at'] = now();
        Device::create($validated);

        return redirect()->route('devices.index')->with('success', 'Perangkat baru berhasil ditambahkan.');
    }

    public function edit(Device $device)
    {
        return view('devices.edit', compact('device'));
    }

    public function update(Request $request, Device $device)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:sensor,camera,combo',
            'has_camera' => 'required|boolean',
            'has_raspi' => 'required|boolean',
            'camera_status' => 'required|string|in:online,offline,none',
            'ai_status' => 'required|string|in:active,inactive,none',
            'ai_model_version' => 'required|string|max:50',
            'location_lat' => 'required|numeric|between:-90,90',
            'location_lng' => 'required|numeric|between:-180,180',
            'status' => 'required|string|in:aman,waspada,bahaya',
        ]);

        $device->update($validated);

        return redirect()->route('devices.index')->with('success', 'Data perangkat berhasil diperbarui.');
    }

    public function destroy(Device $device)
    {
        $device->delete();
        return redirect()->route('devices.index')->with('success', 'Perangkat berhasil dihapus.');
    }
}
