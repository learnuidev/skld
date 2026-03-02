export interface UserProfile {
  id: string;
  email: string;
  roles: string[];
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt: number;
}

export interface UpdateProfileParams {
  name?: string;
  avatar?: string;
  bio?: string;
}
