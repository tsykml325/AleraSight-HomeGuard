/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'Admin' | 'Operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
}

export type DeviceStatus = 'aman' | 'waspada' | 'bahaya';

export interface Device {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  status: DeviceStatus;
  isActive: boolean;
  lastActive: string;
}

export interface SensorData {
  id: string;
  deviceId: string;
  gas: number;
  temperature: number;
  timestamp: string;
  status: DeviceStatus;
}

export interface Notification {
  id: string;
  deviceId: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'alert';
}

export interface AppSettings {
  telegramToken: string;
  gasThreshold: number;
  tempThreshold: number;
  updateInterval: number;
}
