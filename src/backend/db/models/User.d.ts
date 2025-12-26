export type Tier = 'free' | 'basic' | 'pro' | 'proplus';
export interface User {
    user_id: string;
    email: string;
    name?: string;
    tier: Tier;
    wellness_disclaimer_accepted: boolean;
    wellness_disclaimer_accepted_at: string;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
}
export declare class UserModel {
    /**
     * Create a new user
     */
    static create(user: Omit<User, 'created_at' | 'updated_at'>): Promise<User>;
    /**
     * Get user by ID
     */
    static getById(userId: string): Promise<User | null>;
    /**
     * Get user by email (using GSI)
     */
    static getByEmail(email: string): Promise<User | null>;
    /**
     * Update user
     */
    static update(userId: string, updates: Partial<Omit<User, 'user_id' | 'created_at'>>): Promise<User>;
    /**
     * Delete user
     */
    static delete(userId: string): Promise<void>;
}
//# sourceMappingURL=User.d.ts.map