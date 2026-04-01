export interface GitLabFile {
  id: string;
  name: string;
  path: string;
}

export interface GitLabProject {
  id: string;
  name: string;
  files: GitLabFile[];
}

export interface AppSelection {
  projectId: string;
  projectName: string;
  fileId: string;
  fileName: string;
}

// Mock data simulating GitLab projects with config files
const MOCK_PROJECTS: GitLabProject[] = [
  {
    id: 'proj-1',
    name: 'plp-md-web',
    files: [
      { id: 'f1', name: 'plp-md-web-G4.yml', path: 'config/plp-md-web-G4.yml' },
      { id: 'f2', name: 'plp-md-web-Production.yml', path: 'config/plp-md-web-Production.yml' },
    ],
  },
  {
    id: 'proj-2',
    name: 'plp-md-api',
    files: [
      { id: 'f3', name: 'plp-md-api-G4.yml', path: 'config/plp-md-api-G4.yml' },
      { id: 'f4', name: 'plp-md-api-Production.yml', path: 'config/plp-md-api-Production.yml' },
    ],
  },
  {
    id: 'proj-3',
    name: 'plp-md-worker',
    files: [
      { id: 'f5', name: 'plp-md-worker-G4.yml', path: 'config/plp-md-worker-G4.yml' },
      { id: 'f6', name: 'plp-md-worker-Production.yml', path: 'config/plp-md-worker-Production.yml' },
    ],
  },
];

/**
 * Fetch projects and their config files from GitLab.
 * Currently returns mock data; will be replaced with real GitLab API calls.
 */
export async function fetchGitLabProjects(_env: string): Promise<GitLabProject[]> {
  // TODO: Replace with real GitLab API call
  // const res = await fetch(`${GITLAB_BASE_URL}/api/v4/groups/{groupId}/projects`, {
  //   headers: { 'PRIVATE-TOKEN': token },
  // });
  // For each project, fetch files from the repository tree
  return MOCK_PROJECTS;
}

/**
 * Parse a combined "projectId::fileId" selection value.
 */
export function parseSelection(value: string, projects: GitLabProject[]): AppSelection | null {
  const [projectId, fileId] = value.split('::');
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;
  const file = project.files.find(f => f.id === fileId);
  if (!file) return null;
  return { projectId: project.id, projectName: project.name, fileId: file.id, fileName: file.name };
}
