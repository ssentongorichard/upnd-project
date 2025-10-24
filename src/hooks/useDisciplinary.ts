import { useState, useEffect } from 'react';
import { DisciplinaryCase } from '../types';
import { violationTypes } from '../data/zambia';

const generateMockCases = (): DisciplinaryCase[] => {
  const cases: DisciplinaryCase[] = [];
  const severities: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
  const statuses: ('Active' | 'Under Review' | 'Resolved' | 'Appealed')[] = ['Active', 'Under Review', 'Resolved', 'Appealed'];
  
  for (let i = 1; i <= 25; i++) {
    const reportDate = new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
    
    cases.push({
      id: `case-${i}`,
      caseNumber: `UPND-DC-2024-${String(i).padStart(3, '0')}`,
      memberName: `UPND Member ${i}`,
      memberId: `UPND${1000 + i}`,
      violationType: violationTypes[Math.floor(Math.random() * violationTypes.length)],
      description: `Detailed description of violation case ${i}. This case involves potential misconduct that requires investigation and resolution according to UPND party procedures.`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      dateReported: reportDate.toISOString().split('T')[0],
      dateIncident: new Date(reportDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reportingOfficer: `Officer ${Math.floor(Math.random() * 10) + 1}`,
      assignedOfficer: Math.random() > 0.3 ? `Investigator ${Math.floor(Math.random() * 5) + 1}` : undefined,
      actions: [],
      evidence: [],
      notes: []
    });
  }
  
  return cases;
};

export function useDisciplinary() {
  const [cases, setCases] = useState<DisciplinaryCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockCases = generateMockCases();
      setCases(mockCases);
      setLoading(false);
    }, 800);
  }, []);

  const addCase = (caseData: Partial<DisciplinaryCase>) => {
    const newCase: DisciplinaryCase = {
      id: `case-${Date.now()}`,
      caseNumber: `UPND-DC-2024-${String(cases.length + 1).padStart(3, '0')}`,
      memberName: caseData.memberName || '',
      memberId: caseData.memberId || '',
      violationType: caseData.violationType || '',
      description: caseData.description || '',
      severity: caseData.severity || 'Medium',
      status: 'Active',
      dateReported: new Date().toISOString().split('T')[0],
      dateIncident: caseData.dateIncident,
      reportingOfficer: caseData.reportingOfficer || '',
      assignedOfficer: caseData.assignedOfficer,
      actions: [],
      evidence: [],
      notes: []
    };
    
    setCases(prev => [...prev, newCase]);
    return newCase;
  };

  const updateCase = (caseId: string, updates: Partial<DisciplinaryCase>) => {
    setCases(prev =>
      prev.map(case_ =>
        case_.id === caseId
          ? { ...case_, ...updates }
          : case_
      )
    );
  };

  const getCaseById = (id: string): DisciplinaryCase | undefined => {
    return cases.find(case_ => case_.id === id);
  };

  return {
    cases,
    loading,
    addCase,
    updateCase,
    getCaseById
  };
}