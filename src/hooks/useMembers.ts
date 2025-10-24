import useSWR, { mutate } from 'swr';
import { useMemo, useState } from 'react';
import { UPNDMember, Statistics, MembershipStatus } from '../types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useMembers() {
  const [dateRange, setDateRange] = useState<string>('all');
  const { data, isLoading } = useSWR<UPNDMember[]>('/api/members', fetcher);
  const members = data || [];
  const statistics = useMemo(() => calculateStatistics(filterMembersByDateRange(members, dateRange)), [members, dateRange]);

  const fetchMembers = async () => { await mutate('/api/members'); };

  const filterMembersByDateRange = (memberList: UPNDMember[], range: string): UPNDMember[] => {
    if (range === 'allTime' || range === 'all') return memberList;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate = new Date();

    switch (range) {
      case 'today':
        startDate = today;
        break;
      case 'last7':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last90':
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'last180':
        startDate = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return memberList;
    }

    return memberList.filter(member => {
      const registrationDate = new Date(member.registrationDate);
      return registrationDate >= startDate && registrationDate <= now;
    });
  };

  const calculateStatistics = (memberList: UPNDMember[]) => {
    const totalMembers = memberList.length;
    const pendingApplications = memberList.filter(m => m.status.includes('Pending')).length;
    const approvedMembers = memberList.filter(m => m.status === 'Approved').length;
    const rejectedApplications = memberList.filter(m => m.status === 'Rejected').length;
    const suspendedMembers = memberList.filter(m => m.status === 'Suspended').length;

    const provincialDistribution: Record<string, number> = {};
    memberList.forEach(member => {
      const province = member.jurisdiction.province;
      provincialDistribution[province] = (provincialDistribution[province] || 0) + 1;
    });

    // Generate monthly trends from actual registration data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyRegistrations: Record<string, number> = {};

    // Initialize all months with 0
    monthNames.forEach(month => {
      monthlyRegistrations[month] = 0;
    });

    // Count registrations by month
    memberList.forEach(member => {
      const regDate = new Date(member.registrationDate);
      if (regDate.getFullYear() === currentYear) {
        const monthName = monthNames[regDate.getMonth()];
        monthlyRegistrations[monthName]++;
      }
    });

    // Convert to array format for the chart
    const monthlyTrends = monthNames.map(month => ({
      month,
      registrations: monthlyRegistrations[month]
    }));

    const statusDistribution: Record<MembershipStatus, number> = {
      'Pending Section Review': 0,
      'Pending Branch Review': 0,
      'Pending Ward Review': 0,
      'Pending District Review': 0,
      'Pending Provincial Review': 0,
      'Approved': 0,
      'Rejected': 0,
      'Suspended': 0,
      'Expelled': 0
    };

    memberList.forEach(member => {
      statusDistribution[member.status]++;
    });

    return {
      totalMembers,
      pendingApplications,
      approvedMembers,
      rejectedApplications,
      suspendedMembers,
      provincialDistribution,
      monthlyTrends,
      statusDistribution
    } as Statistics;
  };

  const addMember = async (memberData: Partial<UPNDMember>) => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: memberData.fullName,
          nrcNumber: memberData.nrcNumber,
          dateOfBirth: memberData.dateOfBirth,
          residentialAddress: memberData.residentialAddress,
          phone: memberData.phone,
          email: memberData.email,
          jurisdiction: memberData.jurisdiction
        })
      });
      if (!res.ok) throw new Error('Failed to create member');
      await fetchMembers();
      return await res.json();
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  };

  const updateMemberStatus = async (memberId: string, status: MembershipStatus) => {
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchMembers();
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  };

  const updateMember = async (memberId: string, updatedData: Partial<UPNDMember>) => {
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  };

  const getMemberById = (id: string): UPNDMember | undefined => {
    return members.find(member => member.id === id);
  };

  const bulkApprove = async (memberIds: string[]) => {
    try {
      await Promise.all(memberIds.map(id => updateMemberStatus(id, 'Approved')));
      await fetchMembers();
    } catch (error) {
      console.error('Error bulk approving members:', error);
      throw error;
    }
  };

  return {
    members,
    statistics,
    loading: isLoading,
    dateRange,
    setDateRange,
    addMember,
    updateMemberStatus,
    updateMember,
    getMemberById,
    bulkApprove
  };
}