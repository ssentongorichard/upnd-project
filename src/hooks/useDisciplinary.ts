import useSWR, { mutate } from 'swr';
import {
  getDisciplinaryCases,
  createDisciplinaryCase,
  updateDisciplinaryCase as updateCaseAction,
  deleteDisciplinaryCase as deleteCaseAction,
} from '../app/actions/disciplinary';
import type { DisciplinaryCaseInput, DisciplinaryCaseUpdateInput } from '../lib/validations';

export function useDisciplinary(filters?: {
  status?: string;
  severity?: string;
  memberId?: string;
}) {
  // Fetch disciplinary cases with SWR
  const { data: casesData, error, isLoading } = useSWR(
    ['disciplinary-cases', filters],
    () => getDisciplinaryCases(filters),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const cases = casesData?.success ? casesData.data : [];
  const loading = isLoading;

  const addCase = async (caseData: any) => {
    try {
      const result = await createDisciplinaryCase(caseData as DisciplinaryCaseInput);

      if (result.success) {
        // Revalidate cases data
        mutate(['disciplinary-cases', filters]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding disciplinary case:', error);
      throw error;
    }
  };

  const updateCase = async (caseId: string, updatedData: any) => {
    try {
      const result = await updateCaseAction(caseId, updatedData as DisciplinaryCaseUpdateInput);

      if (result.success) {
        // Revalidate cases data
        mutate(['disciplinary-cases', filters]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating disciplinary case:', error);
      throw error;
    }
  };

  const deleteCase = async (caseId: string) => {
    try {
      const result = await deleteCaseAction(caseId);

      if (result.success) {
        // Revalidate cases data
        mutate(['disciplinary-cases', filters]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting disciplinary case:', error);
      throw error;
    }
  };

  const refreshCases = () => {
    mutate(['disciplinary-cases', filters]);
  };

  const getCaseById = (id: string) => {
    return cases.find((case_: any) => case_.id === id);
  };

  return {
    cases,
    loading,
    error,
    addCase,
    updateCase,
    deleteCase,
    refreshCases,
    getCaseById,
  };
}
