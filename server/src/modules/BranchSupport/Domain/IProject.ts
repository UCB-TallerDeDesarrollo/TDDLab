export interface Project {
  id: string; // BIGINT as string or number
  name: string;
  link: string;
  github_user: string;
  created_at: Date;
}

export interface CreateProjectDTO {
  name: string;
  link: string;
  github_user: string;
}

export interface UpdateProjectDTO {
  name?: string;
  link?: string;
}
