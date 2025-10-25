'use client';

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, UserCheck, Search } from 'lucide-react';
import { getEventById } from '@/app/actions/events';
import { checkInMember } from '@/app/actions/events';

interface EventRSVP {
  id: string;
  eventId: string;
  memberId: string;
  response: string;
  respondedAt: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  notes: string;
  member: {
    fullName: string;
    membershipId: string;
    phone: string;
    email: string;
  };
}

interface EventRSVPProps {
  eventId: string;
  eventName: string;
}

export function EventRSVP({ eventId, eventName }: EventRSVPProps) {
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'Going' | 'Not Going' | 'Maybe'>('all');

  useEffect(() => {
    loadRSVPs();
  }, [eventId]);

  const loadRSVPs = async () => {
    try {
      setLoading(true);
      const result = await getEventById(eventId);
      
      if (result.success && result.data) {
        setRsvps(result.data.rsvps || []);
      }
    } catch (error) {
      console.error('Error loading RSVPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (memberId: string) => {
    try {
      const result = await checkInMember(eventId, memberId);
      
      if (result.success) {
        loadRSVPs();
      } else {
        alert('Failed to check in member');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Failed to check in member');
    }
  };

  const handleUndoCheckIn = async (rsvpId: string) => {
    // This would need a new server action to undo check-in
    alert('Undo check-in functionality needs to be implemented');
  };

  const getFilteredRSVPs = () => {
    return rsvps.filter(rsvp => {
      const memberName = rsvp.member?.fullName || '';
      const membershipId = rsvp.member?.membershipId || '';
      
      const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           membershipId.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === 'all') return true;
      return rsvp.response === filter;
    });
  };

  const getResponseColor = (response: string) => {
    switch (response) {
      case 'Going':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Not Going':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Maybe':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getResponseIcon = (response: string) => {
    switch (response) {
      case 'Going':
        return <CheckCircle className="w-4 h-4" />;
      case 'Not Going':
        return <XCircle className="w-4 h-4" />;
      case 'Maybe':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredRSVPs = getFilteredRSVPs();
  const goingCount = rsvps.filter(r => r.response === 'Going').length;
  const checkedInCount = rsvps.filter(r => r.checkedIn).length;
  const notGoingCount = rsvps.filter(r => r.response === 'Not Going').length;
  const maybeCount = rsvps.filter(r => r.response === 'Maybe').length;
  const attendanceRate = goingCount > 0 ? ((checkedInCount / goingCount) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RSVPs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Event RSVPs</h2>
        <p className="text-gray-600 mt-1">{eventName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total RSVPs</p>
              <p className="text-2xl font-bold text-gray-900">{rsvps.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Going</p>
              <p className="text-2xl font-bold text-green-600">{goingCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-blue-600">{checkedInCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Maybe</p>
              <p className="text-2xl font-bold text-yellow-600">{maybeCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or membership ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({rsvps.length})
            </button>
            <button
              onClick={() => setFilter('Going')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'Going'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Going ({goingCount})
            </button>
            <button
              onClick={() => setFilter('Maybe')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'Maybe'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Maybe ({maybeCount})
            </button>
            <button
              onClick={() => setFilter('Not Going')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'Not Going'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Not Going ({notGoingCount})
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredRSVPs.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No RSVPs found</p>
            </div>
          ) : (
            filteredRSVPs.map((rsvp) => (
              <div key={rsvp.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{rsvp.member?.fullName || 'N/A'}</h3>
                        <p className="text-sm text-gray-600">{rsvp.member?.membershipId || 'N/A'}</p>
                      </div>
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getResponseColor(rsvp.response)}`}>
                        {getResponseIcon(rsvp.response)}
                        <span>{rsvp.response}</span>
                      </div>
                      {rsvp.checkedIn && (
                        <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <UserCheck className="w-4 h-4" />
                          <span>Checked In</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span>RSVP: {new Date(rsvp.respondedAt).toLocaleString()}</span>
                      {rsvp.checkedInAt && (
                        <>
                          <span>•</span>
                          <span>Checked in: {new Date(rsvp.checkedInAt).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {rsvp.response === 'Going' && !rsvp.checkedIn && (
                      <button
                        onClick={() => handleCheckIn(rsvp.memberId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Check In
                      </button>
                    )}
                    {rsvp.checkedIn && (
                      <button
                        onClick={() => handleUndoCheckIn(rsvp.id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        Undo Check-In
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
