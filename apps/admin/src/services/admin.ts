import { request } from "@/utils/request";
import { PATH } from "./path";
import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";

// 上传参数接口
export interface UploadParams {
  file: File;
  fileType?: string;
}

// 管理员API服务
export const adminApi = {
  // 上传图片
  uploadImage: (params: UploadParams): Promise<string> => {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.fileType) {
      formData.append('fileType', params.fileType);
    }
    return request.post<string>(PATH.FILE_S3, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// 上传图片Hook
export const useUploadImage = (
  options?: UseMutationOptions<string, Error, UploadParams>
) => {
  return useMutation({
    mutationFn: (params: UploadParams) => adminApi.uploadImage(params),
    ...options,
  });
};