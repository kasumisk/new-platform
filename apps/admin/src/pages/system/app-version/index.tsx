import React, { useState, useRef } from 'react';
import { Card, Button, Space, Tag, Popconfirm, message, Modal, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  StopOutlined,
  ReloadOutlined,
  AndroidOutlined,
  AppleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import ConfigurableProForm from '@/components/ProForm';
import type { FormConfig } from '@/types/form';
import {
  useCreateAppVersion,
  useUpdateAppVersion,
  useDeleteAppVersion,
  usePublishAppVersion,
  useArchiveAppVersion,
  useAppVersionStats,
  appVersionApi,
  type AppVersionInfoDto,
  type AppPlatform,
  type UpdateType,
  type AppVersionStatus,
} from '@/services/appVersionService';

// ==================== 常量配置 ====================

const platformConfig: Record<AppPlatform, { color: string; icon: React.ReactNode; text: string }> = {
  android: { color: 'green', icon: <AndroidOutlined />, text: 'Android' },
  ios: { color: 'blue', icon: <AppleOutlined />, text: 'iOS' },
};

const updateTypeConfig: Record<UpdateType, { color: string; text: string }> = {
  optional: { color: 'processing', text: '可选更新' },
  force: { color: 'error', text: '强制更新' },
};

const statusConfig: Record<AppVersionStatus, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  published: { color: 'success', text: '已发布' },
  archived: { color: 'warning', text: '已归档' },
};

// ==================== 工具函数 ====================

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;
  if(!(Number(size) > 0)) return '';
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size?.toFixed(1)} ${units[unitIndex]}`;
}

// ==================== 主组件 ====================

const AppVersionManagement: React.FC = () => {
  const [currentRecord, setCurrentRecord] = useState<AppVersionInfoDto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const actionRef = useRef<ActionType>(null);

  // API hooks
  const createMutation = useCreateAppVersion({
    onSuccess: () => {
      message.success('创建成功');
      setModalVisible(false);
      setCurrentRecord(null);
      actionRef.current?.reload();
    },
    onError: (error: any) => {
      message.error(`创建失败: ${error.message}`);
    },
  });

  const updateMutation = useUpdateAppVersion({
    onSuccess: () => {
      message.success('更新成功');
      setModalVisible(false);
      setCurrentRecord(null);
      actionRef.current?.reload();
    },
    onError: (error: any) => {
      message.error(`更新失败: ${error.message}`);
    },
  });

  const deleteMutation = useDeleteAppVersion({
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
    onError: (error: any) => {
      message.error(`删除失败: ${error.message}`);
    },
  });

  const publishMutation = usePublishAppVersion({
    onSuccess: () => {
      message.success('发布成功');
      actionRef.current?.reload();
    },
    onError: (error: any) => {
      message.error(`发布失败: ${error.message}`);
    },
  });

  const archiveMutation = useArchiveAppVersion({
    onSuccess: () => {
      message.success('归档成功');
      actionRef.current?.reload();
    },
    onError: (error: any) => {
      message.error(`归档失败: ${error.message}`);
    },
  });

  const { data: stats } = useAppVersionStats({ enabled: statsVisible });

  // ==================== 事件处理 ====================

  const handleCreate = () => {
    setIsEditMode(false);
    setCurrentRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record: AppVersionInfoDto) => {
    setIsEditMode(true);
    setCurrentRecord(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    (deleteMutation.mutate as any)(id);
  };

  const handlePublish = (record: AppVersionInfoDto) => {
    Modal.confirm({
      title: '确认发布',
      content: `确定要发布版本 ${record.platform} v${record.version} 吗？${
        record.grayRelease ? `（灰度比例：${record.grayPercent}%）` : ''
      }`,
      okText: '确认发布',
      cancelText: '取消',
      onOk: () => {
        publishMutation.mutate({ id: record.id });
      },
    });
  };

  const handleArchive = (record: AppVersionInfoDto) => {
    Modal.confirm({
      title: '确认归档',
      content: `确定要归档版本 ${record.platform} v${record.version} 吗？归档后该版本将不再对用户推送。`,
      okText: '确认归档',
      cancelText: '取消',
      onOk: () => {
        (archiveMutation.mutate as any)(record.id);
      },
    });
  };

  const handleFormSubmit = async (values: Record<string, any>) => {
    const formData = {
      ...values,
      fileSize: values.fileSize ? Number(values.fileSize) : undefined,
      grayPercent: values.grayPercent ? Number(values.grayPercent) : 0,
      grayRelease: values.grayRelease ?? false,
      i18nDescription: values.i18nDescription
        ? typeof values.i18nDescription === 'string'
          ? JSON.parse(values.i18nDescription)
          : values.i18nDescription
        : undefined,
      metadata: values.metadata
        ? typeof values.metadata === 'string'
          ? JSON.parse(values.metadata)
          : values.metadata
        : undefined,
    };

    if (isEditMode && currentRecord) {
      updateMutation.mutate({
        id: currentRecord.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData as any);
    }
  };

  // ==================== 表格列定义 ====================

  const columns: ProColumns<AppVersionInfoDto>[] = [
    {
      title: '平台',
      dataIndex: 'platform',
      width: 110,
      valueType: 'select',
      valueEnum: {
        android: { text: 'Android' },
        ios: { text: 'iOS' },
      },
      render: (_: any, record: AppVersionInfoDto) => {
        const config = platformConfig[record.platform];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '版本号',
      dataIndex: 'version',
      width: 100,
      render: (_: any, record: AppVersionInfoDto) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>v{record.version}</span>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 200,
      ellipsis: true,
      search: false,
    },
    {
      title: '更新类型',
      dataIndex: 'updateType',
      width: 110,
      valueType: 'select',
      valueEnum: {
        optional: { text: '可选更新' },
        force: { text: '强制更新' },
      },
      render: (_: any, record: AppVersionInfoDto) => {
        const config = updateTypeConfig[record.updateType];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        published: { text: '已发布', status: 'Success' },
        archived: { text: '已归档', status: 'Warning' },
      },
      render: (_: any, record: AppVersionInfoDto) => {
        const config = statusConfig[record.status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '渠道',
      dataIndex: 'channel',
      width: 100,
      search: false,
      render: (_: any, record: AppVersionInfoDto) => record.channel || '-',
    },
    {
      title: '灰度',
      dataIndex: 'grayRelease',
      width: 90,
      search: false,
      render: (_: any, record: AppVersionInfoDto) =>
        record.grayRelease ? (
          <Tag color="orange">{record.grayPercent}%</Tag>
        ) : (
          <Tag>关闭</Tag>
        ),
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      width: 100,
      search: false,
      render: (_: any, record: AppVersionInfoDto) => formatFileSize(record.fileSize),
    },
    {
      title: '发布时间',
      dataIndex: 'releaseDate',
      width: 120,
      valueType: 'date',
      search: false,
      render: (_: any, record: AppVersionInfoDto) =>
        record.releaseDate
          ? new Date(record.releaseDate).toLocaleDateString('zh-CN')
          : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      fixed: 'right',
      search: false,
      render: (_: any, record: AppVersionInfoDto) => (
        <Space size="small">
          {/* 编辑按钮 */}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {/* 发布按钮（仅草稿可发布） */}
          {record.status === 'draft' && (
            <Button
              type="link"
              size="small"
              icon={<CloudUploadOutlined />}
              onClick={() => handlePublish(record)}
              loading={publishMutation.isPending}
              style={{ color: '#52c41a' }}
            >
              发布
            </Button>
          )}
          {/* 归档按钮（仅已发布可归档） */}
          {record.status === 'published' && (
            <Button
              type="link"
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleArchive(record)}
              loading={archiveMutation.isPending}
              style={{ color: '#faad14' }}
            >
              归档
            </Button>
          )}
          {/* 删除按钮（已发布的不可删除） */}
          {record.status !== 'published' && (
            <Popconfirm
              title="确定要删除这个版本吗？"
              description="删除后不可恢复"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // ==================== 表单配置 ====================

  const formConfig: FormConfig = {
    title: isEditMode ? '编辑版本' : '新增版本',
    layout: 'vertical',
    fields: [
      {
        name: 'platform',
        label: '平台',
        type: 'select',
        required: true,
        options: [
          { label: 'Android', value: 'android' },
          { label: 'iOS', value: 'ios' },
        ],
        fieldProps: {
          placeholder: '选择平台',
          disabled: isEditMode,
        },
      },
      {
        name: 'version',
        label: '版本号',
        type: 'text',
        required: true,
        rules: [
          { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式必须为 x.y.z' },
        ],
        fieldProps: {
          placeholder: '例如: 1.3.0',
          disabled: isEditMode,
        },
      },
      {
        name: 'updateType',
        label: '更新类型',
        type: 'select',
        required: true,
        options: [
          { label: '可选更新', value: 'optional' },
          { label: '强制更新', value: 'force' },
        ],
        fieldProps: {
          placeholder: '选择更新类型',
        },
      },
      {
        name: 'title',
        label: '更新标题',
        type: 'text',
        required: true,
        fieldProps: {
          placeholder: '例如: v1.3.0 新功能发布',
        },
      },
      {
        name: 'description',
        label: '更新描述',
        type: 'textarea',
        required: true,
        fieldProps: {
          placeholder: '支持 Markdown 格式，例如:\n- 新增功能A\n- 优化性能\n- 修复 bug',
          rows: 5,
        },
      },
      {
        name: 'downloadUrl',
        label: '下载链接',
        type: 'text',
        required: true,
        fieldProps: {
          placeholder: 'https://example.com/app-v1.3.0.apk',
        },
      },
      {
        name: 'fileSize',
        label: '文件大小（字节）',
        type: 'number',
        fieldProps: {
          placeholder: '例如: 20480000',
          min: 0,
          style: { width: '100%' },
        },
      },
      {
        name: 'checksum',
        label: '文件校验值',
        type: 'text',
        fieldProps: {
          placeholder: '例如: md5:abc123def456 或 sha256:...',
        },
      },
      {
        name: 'channel',
        label: '分发渠道',
        type: 'select',
        options: [
          { label: '官方渠道', value: 'official' },
          { label: 'App Store', value: 'app_store' },
          { label: 'Google Play', value: 'google_play' },
          { label: '测试渠道', value: 'beta' },
        ],
        fieldProps: {
          placeholder: '选择分发渠道',
          allowClear: true,
        },
      },
      {
        name: 'minSupportVersion',
        label: '最低支持版本',
        type: 'text',
        rules: [
          { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式必须为 x.y.z' },
        ],
        fieldProps: {
          placeholder: '低于此版本将强制更新，例如: 1.0.0',
        },
      },
      {
        name: 'grayRelease',
        label: '灰度发布',
        type: 'switch',
        fieldProps: {
          checkedChildren: '开启',
          unCheckedChildren: '关闭',
        },
      },
      {
        name: 'grayPercent',
        label: '灰度比例 (%)',
        type: 'slider',
        fieldProps: {
          min: 0,
          max: 100,
          marks: { 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' },
        },
      },
      {
        name: 'releaseDate',
        label: '发布时间',
        type: 'date',
        fieldProps: {
          placeholder: '留空则发布时立即生效',
          style: { width: '100%' },
        },
      },
      {
        name: 'i18nDescription',
        label: '多语言描述 (JSON)',
        type: 'textarea',
        fieldProps: {
          rows: 3,
          placeholder: '{"zh-CN": "中文描述", "en-US": "English description"}',
        },
      },
      {
        name: 'metadata',
        label: '扩展元数据 (JSON)',
        type: 'textarea',
        fieldProps: {
          rows: 3,
          placeholder: '{"key": "value"}',
        },
      },
    ],
  };

  // ==================== 渲染 ====================

  return (
    <Card>
      <ProTable<AppVersionInfoDto>
        actionRef={actionRef}
        rowKey="id"
        headerTitle="App 版本管理"
        columns={columns}
        scroll={{ x: 1500 }}
        request={async (params) => {
          try {
            const { list, total } = await appVersionApi.getAppVersions({
              page: params.current,
              pageSize: params.pageSize,
              keyword: params.version,
              platform: params.platform,
              status: params.status,
              updateType: params.updateType,
            });

            return {
              data: list || [],
              total: total || 0,
              success: true,
            };
          } catch (error) {
            console.error('获取版本列表失败:', error);
            return {
              data: [],
              total: 0,
              success: false,
            };
          }
        }}
        toolBarRender={() => [
          <Button
            key="stats"
            icon={<BarChartOutlined />}
            onClick={() => setStatsVisible(true)}
          >
            统计
          </Button>,
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          >
            刷新
          </Button>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增版本
          </Button>,
        ]}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 个版本`,
        }}
        search={{
          labelWidth: 'auto',
        }}
      />

      {/* 新增/编辑表单 */}
      <ConfigurableProForm
        config={formConfig}
        mode="drawer"
        visible={modalVisible}
        onVisibleChange={setModalVisible}
        initialValues={
          currentRecord
            ? {
                ...currentRecord,
                i18nDescription: currentRecord.i18nDescription
                  ? JSON.stringify(currentRecord.i18nDescription, null, 2)
                  : undefined,
                metadata: currentRecord.metadata
                  ? JSON.stringify(currentRecord.metadata, null, 2)
                  : undefined,
              }
            : {
                platform: 'android',
                updateType: 'optional',
                channel: 'official',
                grayRelease: false,
                grayPercent: 0,
              }
        }
        onFinish={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        width={640}
      />

      {/* 统计弹窗 */}
      <Modal
        title="版本统计"
        open={statsVisible}
        onCancel={() => setStatsVisible(false)}
        footer={null}
        width={520}
      >
        {stats && (
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic title="总版本数" value={stats.total} />
            </Col>
            <Col span={12}>
              <Statistic
                title="已发布"
                value={stats.published}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={12}>
              <Statistic title="草稿" value={stats.draft} />
            </Col>
            <Col span={12}>
              <Statistic
                title="已归档"
                value={stats.archived}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Android 版本"
                value={stats.platforms?.android || 0}
                prefix={<AndroidOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="iOS 版本"
                value={stats.platforms?.ios || 0}
                prefix={<AppleOutlined />}
              />
            </Col>
          </Row>
        )}
      </Modal>
    </Card>
  );
};

export default AppVersionManagement;

export const routeConfig = {
  name: 'app-version',
  title: 'App版本管理',
  icon: 'CloudUploadOutlined',
  order: 10,
  requireAuth: true,
  requireAdmin: true,
};
