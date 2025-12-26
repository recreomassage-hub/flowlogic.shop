export type AssessmentStatus = 'processing' | 'completed' | 'failed' | 'invalid';
export type ScoreResult = 'pass' | 'limited' | 'significant';
export interface AssessmentResult {
    score: ScoreResult;
    confidence: number;
    problem_areas?: string[];
    normalized_output?: Record<string, any>;
}
export interface Assessment {
    user_id: string;
    assessment_id: string;
    test_id: number;
    test_name: string;
    video_url: string;
    status: AssessmentStatus;
    attempt_number: number;
    quality_score?: number;
    confidence_avg?: number;
    motion_variance?: number;
    result?: AssessmentResult;
    feedback?: string;
    created_at: string;
    completed_at?: string;
    month_key: string;
}
export declare class AssessmentModel {
    /**
     * Create a new assessment
     */
    static create(assessment: Omit<Assessment, 'created_at'>): Promise<Assessment>;
    /**
     * Get assessment by ID
     */
    static getById(userId: string, assessmentId: string): Promise<Assessment | null>;
    /**
     * Get assessments by user ID
     */
    static getByUserId(userId: string, limit?: number): Promise<Assessment[]>;
    /**
     * Get assessments by test type (using GSI)
     */
    static getByTestType(testId: number, limit?: number): Promise<Assessment[]>;
    /**
     * Get assessments by month (using GSI)
     */
    static getByMonth(monthKey: string, limit?: number): Promise<Assessment[]>;
    /**
     * Update assessment
     */
    static update(userId: string, assessmentId: string, updates: Partial<Omit<Assessment, 'user_id' | 'assessment_id' | 'created_at'>>): Promise<Assessment>;
    /**
     * Delete assessment
     */
    static delete(userId: string, assessmentId: string): Promise<void>;
}
//# sourceMappingURL=Assessment.d.ts.map