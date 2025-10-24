import { useState, useEffect, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { UPNDMember, Statistics, MembershipStatus } from '../types';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember as updateMemberAction,
  updateMemberStatus as updateMemberStatusAction,
  getMemberStatistics,
  bulkApprovemembers,
} from '../app/actions/members';
import type { MemberRegistrationInput, MemberUpdateInput } from '../lib/validations';

export function useMembers(filters?: {
  status?: string;
  province?: string;
  district?: string;
  searchTerm?: string;
}) {
  const [dateRange, setDateRange] = useState<string>('all');
  const [localStatistics, setLocalStatistics] = useState<Statistics | null>(null);

  // Fetch members with SWR
  const { data: membersData, error, isLoading } = useSWR(
    ['members', filters],
    () => getMembers(filters),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // Fetch statistics with SWR
  const { data: statsData } = useSWR(
    ['member-statistics', dateRange],
    () => getMemberStatistics(dateRange),
    {
      refreshInterval: 60000, // Refresh every minute
    }
  );

  const members = membersData?.success ? membersData.data : [];
  const loading = isLoading;

  useEffect(() => {
    if (members.length > 0) {
      const filteredMembers = filterMembersByDateRange(members, dateRange);
      calculateStatistics(filteredMembers);
    }
  }, [dateRange, members]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedMembers: UPNDMember[] = (data || []).map((row: any) => ({
        id: row.id,
        membershipId: row.membership_id,
        fullName: row.full_name,
        nrcNumber: row.nrc_number,
        dateOfBirth: row.date_of_birth,
        residentialAddress: row.residential_address,
        phone: row.phone,
        email: row.email,
        endorsements: [],
        status: row.status as MembershipStatus,
        registrationDate: row.registration_date,
        jurisdiction: {
          province: row.province,
          district: row.district,
          constituency: row.constituency,
          ward: row.ward,
          branch: row.branch,
          section: row.section
        },
        disciplinaryRecords: [],
        appeals: [],
        partyCommitment: row.party_commitment || 'Unity, Work, Progress'
      }));

      setMembers(mappedMembers);
      calculateStatistics(mappedMembers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
    }
  };

  const filterMembersByDateRange = useCallback((memberList: any[], range: string): any[] => {
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
  }, []);

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

    setLocalStatistics({
      totalMembers,
      pendingApplications,
      approvedMembers,
      rejectedApplications,
      suspendedMembers,
      provincialDistribution,
      monthlyTrends,
      statusDistribution
    });
  }, []);

  const addMember = async (memberData: any) => {
    try {
      const result = await createMember({
        fullName: memberData.fullName,
        nrcNumber: memberData.nrcNumber,
        dateOfBirth: memberData.dateOfBirth,
        phone: memberData.phone,
        email: memberData.email,
        residentialAddress: memberData.residentialAddress,
        province: memberData.jurisdiction?.province,
        district: memberData.jurisdiction?.district,
        constituency: memberData.jurisdiction?.constituency,
        ward: memberData.jurisdiction?.ward,
        branch: memberData.jurisdiction?.branch,
        section: memberData.jurisdiction?.section,
        partyCommitment: 'Unity, Work, Progress',
      } as MemberRegistrationInput);

      if (result.success) {
        // Revalidate members data
        mutate(['members', filters]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  };

  const updateMemberStatus = async (memberId: string, status: MembershipStatus) => {
    try {
      const result = await updateMemberStatusAction({ id: memberId, status });
      
      if (result.success) {
        // Revalidate members data
        mutate(['members', filters]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  };

  const updateMember = async (memberId: string, updatedData: any) => {
    try {
      const result = await updateMemberAction(memberId, updatedData as MemberUpdateInput);
      
      if (result.success) {
        // Revalidate members data
        mutate(['members', filters]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  };

  const getMemberById = async (id: string) => {
    try {
      const result = await getMemberById(id);
      return result.success ? result.data : undefined;
    } catch (error) {
      console.error('Error fetching member:', error);
      return undefined;
    }
  };

  const bulkApprove = async (memberIds: string[]) => {
    try {
      const result = await bulkApprovemembers(memberIds);
      
      if (result.success) {
        // Revalidate members data
        mutate(['members', filters]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error bulk approving members:', error);
      throw error;
    }
  };

  return {
    members,
    statistics: statsData?.success ? statsData.data : localStatistics,
    loading,
    error,
    dateRange,
    setDateRange,
    addMember,
    updateMemberStatus,
    updateMember,
    getMemberById,
    bulkApprove,
  };
}