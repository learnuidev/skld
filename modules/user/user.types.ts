export type UserRole = "learner" | "creator";

export interface UserProfile {
  id: string;
  email: string;
  roles: UserRole[];
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt: number;
}

export interface UpdateProfileParams {
  name?: string;
  avatar?: string;
  bio?: string;
  addRole?: "creator";
}
