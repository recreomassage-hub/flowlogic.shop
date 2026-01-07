import { apiClient } from './client';

export interface Assessment {
  user_id: string;
  assessment_id: string;
  test_id: number;
  test_name: string;
  video_url: string;
  status: 'processing' | 'completed' | 'failed' | 'invalid';
  attempt_number: number;
  quality_score?: number;
  confidence_avg?: number;
  motion_variance?: number;
  result?: {
    score: 'pass' | 'limited' | 'significant';
    confidence: number;
    problem_areas?: string[];
    normalized_output?: Record<string, any>;
  };
  feedback?: string;
  created_at: string;
  completed_at?: string;
  month_key: string;
}

export interface CreateAssessmentRequest {
  test_id: number;
}

export interface CreateAssessmentResponse {
  assessment_id: string;
  upload_url: string;
  expires_in: number;
}

export interface UpdateAssessmentRequest {
  video_uploaded: boolean;
}

export const assessmentsApi = {
  getAssessments: async (params?: { month?: string; test_id?: number }): Promise<Assessment[]> => {
    const response = await apiClient.get<{ assessments: Assessment[] }>('/v1/assessments', { params });
    return response.data.assessments;
  },

  createAssessment: async (data: CreateAssessmentRequest): Promise<CreateAssessmentResponse> => {
    try {
      const response = await apiClient.post<CreateAssessmentResponse>('/v1/assessments', data);
      return response.data;
    } catch (error: any) {
      // Дополнительная диагностика
      console.error('Create assessment error details:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw error;
    }
  },

  getAssessment: async (assessmentId: string): Promise<Assessment> => {
    const response = await apiClient.get<Assessment>(`/v1/assessments/${assessmentId}`);
    return response.data;
  },

  updateAssessment: async (assessmentId: string, data: UpdateAssessmentRequest): Promise<Assessment> => {
    const response = await apiClient.put<Assessment>(`/v1/assessments/${assessmentId}`, data);
    return response.data;
  },

  exportAssessment: async (assessmentId: string): Promise<Blob> => {
    const response = await apiClient.get(`/v1/assessments/${assessmentId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};







