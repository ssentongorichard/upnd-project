import { useState, useEffect } from 'react';
import { UPNDMember, Statistics, MembershipStatus, Jurisdiction } from '../types';
import { supabase } from '../lib/supabase';

export function useMembers() {
  const [members, setMembers] = useState<UPNDMember[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('all');

  useEffect(() => {
    fetchMembers();
  }, []);

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

    setStatistics({
      totalMembers,
      pendingApplications,
      approvedMembers,
      rejectedApplications,
      suspendedMembers,
      provincialDistribution,
      monthlyTrends,
      statusDistribution
    });
  };

  const addMember = async (memberData: Partial<UPNDMember>) => {
    try {
      const membershipId = `UPND${Date.now()}`;

      const { data, error } = await supabase
        .from('members')
        .insert({
          membership_id: membershipId,
          full_name: memberData.fullName || '',
          nrc_number: memberData.nrcNumber || '',
          date_of_birth: memberData.dateOfBirth || '',
          residential_address: memberData.residentialAddress || '',
          phone: memberData.phone || '',
          email: memberData.email || null,
          province: memberData.jurisdiction?.province || '',
          district: memberData.jurisdiction?.district || '',
          constituency: memberData.jurisdiction?.constituency || '',
          ward: memberData.jurisdiction?.ward || '',
          branch: memberData.jurisdiction?.branch || '',
          section: memberData.jurisdiction?.section || '',
          status: 'Pending Section Review',
          party_commitment: 'Unity, Work, Progress'
        })
        .select()
        .single();

      if (error) throw error;

      const newMember: UPNDMember = {
        id: data.id,
        membershipId: data.membership_id,
        fullName: data.full_name,
        nrcNumber: data.nrc_number,
        dateOfBirth: data.date_of_birth,
        residentialAddress: data.residential_address,
        phone: data.phone,
        email: data.email,
        endorsements: memberData.endorsements || [],
        status: data.status as MembershipStatus,
        registrationDate: data.registration_date,
        jurisdiction: {
          province: data.province,
          district: data.district,
          constituency: data.constituency,
          ward: data.ward,
          branch: data.branch,
          section: data.section
        },
        disciplinaryRecords: [],
        appeals: [],
        partyCommitment: data.party_commitment
      };

      setMembers(prev => [newMember, ...prev]);
      return newMember;
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  };

  const updateMemberStatus = async (memberId: string, status: MembershipStatus) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ status })
        .eq('id', memberId);

      if (error) throw error;

      setMembers(prev =>
        prev.map(member =>
          member.id === memberId
            ? { ...member, status }
            : member
        )
      );
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  };

  const updateMember = async (memberId: string, updatedData: Partial<UPNDMember>) => {
    try {
      const updatePayload: any = {};

      if (updatedData.fullName !== undefined) updatePayload.full_name = updatedData.fullName;
      if (updatedData.nrcNumber !== undefined) updatePayload.nrc_number = updatedData.nrcNumber;
      if (updatedData.dateOfBirth !== undefined) updatePayload.date_of_birth = updatedData.dateOfBirth;
      if (updatedData.phone !== undefined) updatePayload.phone = updatedData.phone;
      if (updatedData.email !== undefined) updatePayload.email = updatedData.email || null;
      if (updatedData.residentialAddress !== undefined) updatePayload.residential_address = updatedData.residentialAddress;
      if (updatedData.partyCommitment !== undefined) updatePayload.party_commitment = updatedData.partyCommitment;

      if (updatedData.jurisdiction) {
        if (updatedData.jurisdiction.province !== undefined) updatePayload.province = updatedData.jurisdiction.province;
        if (updatedData.jurisdiction.district !== undefined) updatePayload.district = updatedData.jurisdiction.district;
        if (updatedData.jurisdiction.constituency !== undefined) updatePayload.constituency = updatedData.jurisdiction.constituency;
        if (updatedData.jurisdiction.ward !== undefined) updatePayload.ward = updatedData.jurisdiction.ward;
        if (updatedData.jurisdiction.branch !== undefined) updatePayload.branch = updatedData.jurisdiction.branch;
        if (updatedData.jurisdiction.section !== undefined) updatePayload.section = updatedData.jurisdiction.section;
      }

      console.log('Updating member with payload:', updatePayload);

      const { data, error } = await supabase
        .from('members')
        .update(updatePayload)
        .eq('id', memberId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Update successful:', data);

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
      const { error } = await supabase
        .from('members')
        .update({ status: 'Approved' })
        .in('id', memberIds);

      if (error) throw error;

      setMembers(prev =>
        prev.map(member =>
          memberIds.includes(member.id)
            ? { ...member, status: 'Approved' as MembershipStatus }
            : member
        )
      );
    } catch (error) {
      console.error('Error bulk approving members:', error);
      throw error;
    }
  };

  return {
    members,
    statistics,
    loading,
    dateRange,
    setDateRange,
    addMember,
    updateMemberStatus,
    updateMember,
    getMemberById,
    bulkApprove
  };
}