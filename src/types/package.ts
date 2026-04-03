export interface PackageVersion {
  version: string;
  publishedAt: string;
  digest: string;
  downloads: number;
  changelog?: string;
}

export interface PackageAuthor {
  name: string;
  email?: string;
  avatarUrl?: string;
  githubUsername?: string;
}

export interface PackageDependency {
  name: string;
  namespace: string;
  versionConstraint: string;
}

export interface Package {
  id: string;
  namespace: string;
  name: string;
  displayName: string;
  description: string;
  readme: string;
  license: string;
  repositoryUrl?: string;
  homepageUrl?: string;
  keywords: string[];
  latestVersion: string;
  versions: PackageVersion[];
  author: PackageAuthor;
  dependencies: PackageDependency[];
  totalDownloads: number;
  weeklyDownloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackageSearchResult {
  id: string;
  namespace: string;
  name: string;
  description: string;
  latestVersion: string;
  author: PackageAuthor;
  totalDownloads: number;
  weeklyDownloads: number;
  keywords: string[];
  updatedAt: string;
}

export interface PackageSearchResponse {
  packages: PackageSearchResult[];
  total: number;
  page: number;
  pageSize: number;
}
