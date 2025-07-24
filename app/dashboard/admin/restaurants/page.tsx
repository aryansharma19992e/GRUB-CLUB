'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminApproveRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch('/api/restaurants?limit=1000', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        setRestaurants(data.restaurants || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load restaurants');
        setLoading(false);
      });
  }, []);

  const handleApprove = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    await fetch(`/api/restaurants/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: 'approved' }),
    });
    setRestaurants((prev) => prev.map(r => r._id === id ? { ...r, status: 'approved' } : r));
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Approve Restaurants</h1>
      <p className="mb-4 text-gray-600">Review and approve new restaurant registrations.</p>
      {loading ? (
        <div className="text-center text-gray-400">Loading restaurants...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Owner</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map(rest => (
                <tr key={rest._id} className="border-t">
                  <td className="px-4 py-2 font-semibold">{rest.name}</td>
                  <td className="px-4 py-2">{rest.ownerId?.name || rest.ownerId || '-'}</td>
                  <td className="px-4 py-2 capitalize">{rest.status}</td>
                  <td className="px-4 py-2">
                    {rest.status !== 'approved' ? (
                      <Button size="sm" onClick={() => handleApprove(rest._id)} disabled={actionLoading[rest._id]}>
                        {actionLoading[rest._id] ? 'Approving...' : 'Approve'}
                      </Button>
                    ) : (
                      <span className="text-green-600 font-medium">Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 