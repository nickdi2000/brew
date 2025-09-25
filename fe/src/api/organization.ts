import { getOrganizationByCode as getOrgByCode } from './index';

export const getOrganizationByCode = async (code: string) => {
  try {
    const response = await getOrgByCode(code);
    return response; // Return the full response, not response.data
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Organization not found');
    }
    throw error;
  }
};
