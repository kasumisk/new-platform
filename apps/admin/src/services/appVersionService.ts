/**
 * App 版本管理服务
 * 使用 React Query 进行状态管理
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import request from '../utils/request';
import { PATH } from './path';

// ==================== 类型定义 ====================

export type AppPlatform = 'android' | 'ios';
export type UpdateType = 'optional' | 'force';
export type AppVersionStatus = 'draft' | 'published' | 'archived';

export interface GetAppVersionsQueryDto {
  page?: number;
  pageSize?: number;
  keyword?: string;
  platform?: AppPlatform;
  status?: AppVersionStatus;
  updateType?: UpdateType;
  channel?: string;
}

export interface CreateAppVersionDto {
  platform: AppPlatform;
  version: string;
  updateType: UpdateType;
  title: string;
  description: string;
  downloadUrl: string;
  fileSize?: number;
  checksum?: string;
  channel?: string;
  minSupportVersion?: string;
  status?: AppVersionStatus;
  grayRelease?: boolean;
  grayPercent?: number;
  releaseDate?: string;
  i18nDescription?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface UpdateAppVersionDto {
  updateType?: UpdateType;
  title?: string;
  description?: string;
  downloadUrl?: string;
  fileSize?: number;
  checksum?: string;
  channel?: string;
  minSupportVersion?: string;
  status?: AppVersionStatus;
  grayRelease?: boolean;
  grayPercent?: number;
  releaseDate?: string;
  i18nDescription?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface AppVersionInfoDto {
  id: string;
  platform: AppPlatform;
  version: string;
  versionCode: number;
  updateType: UpdateType;
  title: string;
  description: string;
  downloadUrl: string;
  fileSize: number;
  checksum?: string;
  channel: string;
  minSupportVersion?: string;
  status: AppVersionStatus;
  grayRelease: boolean;
  grayPercent: number;
  releaseDate?: string;
  i18nDescription?: Record<string, string>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AppVersionsListResponseDto {
  list: AppVersionInfoDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AppVersionStatsDto {
  total: number;
  published: number;
  draft: number;
  archived: number;
  platforms: {
    android: number;
    ios: number;
  };
}

// ==================== Query Keys ====================

export const appVersionQueryKeys = {
  appVersions: ['appVersions'] as const,
  appVersionList: (params?: GetAppVersionsQueryDto) =>
    [...appVersionQueryKeys.appVersions, 'list', params] as const,
  appVersion: (id: string) =>
    [...appVersionQueryKeys.appVersions, 'detail', id] as const,
  stats: () => [...appVersionQueryKeys.appVersions, 'stats'] as const,
};

// ==================== API Functions ====================

export const appVersionApi = {
  getAppVersions: async (
    params?: GetAppVersionsQueryDto,
  ): Promise<AppVersionsListResponseDto> => {
    return await request.get<AppVersionsListResponseDto>(
      PATH.ADMIN.APP_VERSIONS,
      params,
    );
  },

  getAppVersionById: async (id: string): Promise<AppVersionInfoDto> => {
    return await request.get<AppVersionInfoDto>(
      `${PATH.ADMIN.APP_VERSIONS}/${id}`,
    );
  },

  createAppVersion: async (
    data: CreateAppVersionDto,
  ): Promise<AppVersionInfoDto> => {
    return await request.post<AppVersionInfoDto>(
      PATH.ADMIN.APP_VERSIONS,
      data,
    );
  },

  updateAppVersion: async (
    id: string,
    data: UpdateAppVersionDto,
  ): Promise<AppVersionInfoDto> => {
    return await request.put<AppVersionInfoDto>(
      `${PATH.ADMIN.APP_VERSIONS}/${id}`,
      data,
    );
  },

  deleteAppVersion: async (id: string): Promise<void> => {
    await request.delete(`${PATH.ADMIN.APP_VERSIONS}/${id}`);
  },

  publishAppVersion: async (
    id: string,
    data?: { releaseDate?: string },
  ): Promise<AppVersionInfoDto> => {
    return await request.post<AppVersionInfoDto>(
      `${PATH.ADMIN.APP_VERSIONS}/${id}/publish`,
      data,
    );
  },

  archiveAppVersion: async (id: string): Promise<AppVersionInfoDto> => {
    return await request.post<AppVersionInfoDto>(
      `${PATH.ADMIN.APP_VERSIONS}/${id}/archive`,
    );
  },

  getStats: async (): Promise<AppVersionStatsDto> => {
    return await request.get<AppVersionStatsDto>(
      `${PATH.ADMIN.APP_VERSIONS}/stats`,
    );
  },
};

// ==================== React Query Hooks ====================

export const useAppVersions = (
  params?: GetAppVersionsQueryDto,
  options?: any,
) => {
  return useQuery({
    queryKey: appVersionQueryKeys.appVersionList(params),
    queryFn: () => appVersionApi.getAppVersions(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useAppVersion = (id: string, options?: any) => {
  return useQuery({
    queryKey: appVersionQueryKeys.appVersion(id),
    queryFn: () => appVersionApi.getAppVersionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useAppVersionStats = (options?: any) => {
  return useQuery({
    queryKey: appVersionQueryKeys.stats(),
    queryFn: () => appVersionApi.getStats(),
    staleTime: 60 * 1000,
    ...options,
  });
};

export const useCreateAppVersion = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appVersionApi.createAppVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appVersionQueryKeys.appVersions,
      });
    },
    ...options,
  });
};

export const useUpdateAppVersion = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppVersionDto }) =>
      appVersionApi.updateAppVersion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: appVersionQueryKeys.appVersion(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: appVersionQueryKeys.appVersions,
      });
    },
    ...options,
  });
};

export const useDeleteAppVersion = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appVersionApi.deleteAppVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appVersionQueryKeys.appVersions,
      });
    },
    ...options,
  });
};

export const usePublishAppVersion = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: { releaseDate?: string };
    }) => appVersionApi.publishAppVersion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appVersionQueryKeys.appVersions,
      });
    },
    ...options,
  });
};

export const useArchiveAppVersion = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appVersionApi.archiveAppVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appVersionQueryKeys.appVersions,
      });
    },
    ...options,
  });
};
