import { apiClient } from './client';
import { DashboardStats } from '../types';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/admin/dashboard');
  return data;
}
