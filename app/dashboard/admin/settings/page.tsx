'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminSystemSettingsPage() {
  const [platformName, setPlatformName] = useState('Grub Club');
  const [maintenance, setMaintenance] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setMsg('Settings saved! (UI only)');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>
      <p className="mb-4 text-gray-600">Manage platform-wide settings and maintenance mode.</p>
      <form onSubmit={handleSave} className="bg-white rounded shadow p-6 space-y-6">
        <div>
          <label className="block font-medium mb-1">Platform Name</label>
          <input
            className="border p-2 rounded w-full"
            value={platformName}
            onChange={e => setPlatformName(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="maintenance"
            checked={maintenance}
            onChange={e => setMaintenance(e.target.checked)}
            className="h-5 w-5"
          />
          <label htmlFor="maintenance" className="font-medium">Enable Maintenance Mode</label>
        </div>
        <Button type="submit">Save Settings</Button>
        {msg && <div className="text-green-600 mt-2">{msg}</div>}
      </form>
    </div>
  );
} 