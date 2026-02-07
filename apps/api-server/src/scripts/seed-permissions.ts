/**
 * 权限系统初始化种子数据
 * 运行方式：npx ts-node -r tsconfig-paths/register src/scripts/seed-permissions.ts
 */
import { DataSource } from 'typeorm';
import { Role, RoleStatus } from '../entities/role.entity';
import {
  Permission,
  PermissionType,
  PermissionStatus,
  HttpMethod,
} from '../entities/permission.entity';
import { PermissionTemplate } from '../entities/permission-template.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserRole } from '../entities/user-role.entity';
import { User } from '../entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

// 创建数据源
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ai_platform',
  entities: [
    Role,
    Permission,
    PermissionTemplate,
    RolePermission,
    UserRole,
    User,
  ],
  synchronize: true, // 自动同步创建表
});

// 预定义角色
const roles: Partial<Role>[] = [
  {
    code: 'SUPER_ADMIN',
    name: '超级管理员',
    description: '系统超级管理员，拥有所有权限',
    isSystem: true,
    status: RoleStatus.ACTIVE,
    sort: 0,
  },
  {
    code: 'ADMIN',
    name: '管理员',
    description: '系统管理员',
    isSystem: true,
    status: RoleStatus.ACTIVE,
    sort: 1,
  },
  {
    code: 'OPERATOR',
    name: '运营人员',
    description: '负责日常运营管理',
    isSystem: false,
    status: RoleStatus.ACTIVE,
    sort: 2,
  },
];

// 预定义权限（菜单 + 操作）
const permissions: Partial<Permission>[] = [
  // ========== 仪表盘 ==========
  {
    code: 'dashboard',
    name: '仪表盘',
    type: PermissionType.MENU,
    icon: 'DashboardOutlined',
    isSystem: true,
    sort: 0,
  },

  // ========== 用户管理 ==========
  {
    code: 'user',
    name: '用户管理',
    type: PermissionType.MENU,
    icon: 'UserOutlined',
    isSystem: true,
    sort: 10,
  },
  {
    code: 'user:list',
    name: '查看用户列表',
    type: PermissionType.OPERATION,
    action: HttpMethod.GET,
    resource: '/admin/users',
    isSystem: true,
    sort: 0,
  },
  {
    code: 'user:detail',
    name: '查看用户详情',
    type: PermissionType.OPERATION,
    action: HttpMethod.GET,
    resource: '/admin/users/:id',
    isSystem: true,
    sort: 1,
  },
  {
    code: 'user:create',
    name: '创建用户',
    type: PermissionType.OPERATION,
    action: HttpMethod.POST,
    resource: '/admin/users',
    isSystem: true,
    sort: 2,
  },
  {
    code: 'user:update',
    name: '更新用户',
    type: PermissionType.OPERATION,
    action: HttpMethod.PUT,
    resource: '/admin/users/:id',
    isSystem: true,
    sort: 3,
  },
  {
    code: 'user:delete',
    name: '删除用户',
    type: PermissionType.OPERATION,
    action: HttpMethod.DELETE,
    resource: '/admin/users/:id',
    isSystem: true,
    sort: 4,
  },

  // ========== 角色管理 ==========
  {
    code: 'role',
    name: '角色管理',
    type: PermissionType.MENU,
    icon: 'TeamOutlined',
    isSystem: true,
    sort: 20,
  },
  {
    code: 'role:list',
    name: '查看角色列表',
    type: PermissionType.OPERATION,
    action: HttpMethod.GET,
    resource: '/admin/roles',
    isSystem: true,
    sort: 0,
  },
  {
    code: 'role:detail',
    name: '查看角色详情',
    type: PermissionType.OPERATION,
    action: HttpMethod.GET,
    resource: '/admin/roles/:id',
    isSystem: true,
    sort: 1,
  },
  {
    code: 'role:create',
    name: '创建角色',
    type: PermissionType.OPERATION,
    action: HttpMethod.POST,
    resource: '/admin/roles',
    isSystem: true,
    sort: 2,
  },
  {
    code: 'role:update',
    name: '更新角色',
    type: PermissionType.OPERATION,
    action: HttpMethod.PUT,
    resource: '/admin/roles/:id',
    isSystem: true,
    sort: 3,
  },
  {
    code: 'role:delete',
    name: '删除角色',
    type: PermissionType.OPERATION,
    action: HttpMethod.DELETE,
    resource: '/admin/roles/:id',
    isSystem: true,
    sort: 4,
  },
  {
    code: 'role:assign',
    name: '分配权限',
    type: PermissionType.OPERATION,
    action: HttpMethod.POST,
    resource: '/admin/roles/:id/permissions',
    isSystem: true,
    sort: 5,
  },

  // ========== 权限管理 ==========
  {
    code: 'permission',
    name: '权限管理',
    type: PermissionType.MENU,
    icon: 'SafetyOutlined',
    isSystem: true,
    sort: 30,
  },
  {
    code: 'permission:list',
    name: '查看权限列表',
    type: PermissionType.OPERATION,
    action: HttpMethod.GET,
    resource: '/admin/rbac-permissions',
    isSystem: true,
    sort: 0,
  },
  {
    code: 'permission:create',
    name: '创建权限',
    type: PermissionType.OPERATION,
    action: HttpMethod.POST,
    resource: '/admin/rbac-permissions',
    isSystem: true,
    sort: 1,
  },
  {
    code: 'permission:update',
    name: '更新权限',
    type: PermissionType.OPERATION,
    action: HttpMethod.PUT,
    resource: '/admin/rbac-permissions/:id',
    isSystem: true,
    sort: 2,
  },
  {
    code: 'permission:delete',
    name: '删除权限',
    type: PermissionType.OPERATION,
    action: HttpMethod.DELETE,
    resource: '/admin/rbac-permissions/:id',
    isSystem: true,
    sort: 3,
  },

  // ========== 客户端管理 ==========
  {
    code: 'client',
    name: '客户端管理',
    type: PermissionType.MENU,
    icon: 'ApiOutlined',
    isSystem: true,
    sort: 40,
  },
  {
    code: 'client:list',
    name: '查看客户端列表',
    type: PermissionType.OPERATION,
    action: HttpMethod.GET,
    resource: '/admin/clients',
    isSystem: true,
    sort: 0,
  },
  {
    code: 'client:create',
    name: '创建客户端',
    type: PermissionType.OPERATION,
    action: HttpMethod.POST,
    resource: '/admin/clients',
    isSystem: true,
    sort: 1,
  },
  {
    code: 'client:update',
    name: '更新客户端',
    type: PermissionType.OPERATION,
    action: HttpMethod.PUT,
    resource: '/admin/clients/:id',
    isSystem: true,
    sort: 2,
  },
  {
    code: 'client:delete',
    name: '删除客户端',
    type: PermissionType.OPERATION,
    action: HttpMethod.DELETE,
    resource: '/admin/clients/:id',
    isSystem: true,
    sort: 3,
  },

  // ========== 模型管理 ==========
  {
    code: 'model',
    name: '模型管理',
    type: PermissionType.MENU,
    icon: 'RobotOutlined',
    isSystem: true,
    sort: 50,
  },
  {
    code: 'model:list',
    name: '查看模型列表',
    type: PermissionType.OPERATION,
    action: HttpMethod.GET,
    resource: '/admin/models',
    isSystem: true,
    sort: 0,
  },
  {
    code: 'model:create',
    name: '创建模型',
    type: PermissionType.OPERATION,
    action: HttpMethod.POST,
    resource: '/admin/models',
    isSystem: true,
    sort: 1,
  },
  {
    code: 'model:update',
    name: '更新模型',
    type: PermissionType.OPERATION,
    action: HttpMethod.PUT,
    resource: '/admin/models/:id',
    isSystem: true,
    sort: 2,
  },
  {
    code: 'model:delete',
    name: '删除模型',
    type: PermissionType.OPERATION,
    action: HttpMethod.DELETE,
    resource: '/admin/models/:id',
    isSystem: true,
    sort: 3,
  },

  // ========== 供应商管理 ==========
  {
    code: 'provider',
    name: '供应商管理',
    type: PermissionType.MENU,
    icon: 'CloudServerOutlined',
    isSystem: true,
    sort: 60,
  },
  {
    code: 'provider:list',
    name: '查看供应商列表',
    type: PermissionType.OPERATION,
    action: HttpMethod.GET,
    resource: '/admin/providers',
    isSystem: true,
    sort: 0,
  },
  {
    code: 'provider:create',
    name: '创建供应商',
    type: PermissionType.OPERATION,
    action: HttpMethod.POST,
    resource: '/admin/providers',
    isSystem: true,
    sort: 1,
  },
  {
    code: 'provider:update',
    name: '更新供应商',
    type: PermissionType.OPERATION,
    action: HttpMethod.PUT,
    resource: '/admin/providers/:id',
    isSystem: true,
    sort: 2,
  },

  // ========== 统计分析 ==========
  {
    code: 'analytics',
    name: '统计分析',
    type: PermissionType.MENU,
    icon: 'AreaChartOutlined',
    isSystem: true,
    sort: 70,
  },
  {
    code: 'analytics:view',
    name: '查看统计',
    type: PermissionType.OPERATION,
    action: HttpMethod.GET,
    resource: '/admin/analytics',
    isSystem: true,
    sort: 0,
  },
];

// 权限模板
const templates: Partial<PermissionTemplate>[] = [
  {
    code: 'READONLY',
    name: '只读权限',
    description: '仅允许查看数据，不能修改',
    permissionPatterns: ['*:list', '*:detail'],
    isSystem: true,
  },
  {
    code: 'CRUD',
    name: '增删改查',
    description: '完整的增删改查权限',
    permissionPatterns: [
      '*:list',
      '*:detail',
      '*:create',
      '*:update',
      '*:delete',
    ],
    isSystem: true,
  },
  {
    code: 'OPERATOR',
    name: '运营权限',
    description: '运营人员默认权限',
    permissionPatterns: [
      'dashboard',
      'user:list',
      'user:detail',
      'client:list',
      'client:detail',
      'analytics:view',
    ],
    isSystem: true,
  },
];

async function seed() {
  console.log('🔄 开始初始化权限数据...');

  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);
  const permissionRepo = AppDataSource.getRepository(Permission);
  const templateRepo = AppDataSource.getRepository(PermissionTemplate);
  const rolePermissionRepo = AppDataSource.getRepository(RolePermission);

  // 创建角色
  console.log('📦 创建角色...');
  const savedRoles: Role[] = [];
  for (const roleData of roles) {
    const existing = await roleRepo.findOne({ where: { code: roleData.code } });
    if (!existing) {
      const role = roleRepo.create({
        ...roleData,
        status: roleData.status || RoleStatus.ACTIVE,
      });
      const saved = await roleRepo.save(role);
      savedRoles.push(saved);
      console.log(`  ✅ 创建角色: ${roleData.name} (${roleData.code})`);
    } else {
      savedRoles.push(existing);
      console.log(`  ⏭️  角色已存在: ${roleData.name} (${roleData.code})`);
    }
  }

  // 设置 OPERATOR 继承 ADMIN
  const adminRole = savedRoles.find((r) => r.code === 'ADMIN');
  const operatorRole = savedRoles.find((r) => r.code === 'OPERATOR');
  if (adminRole && operatorRole && !operatorRole.parentId) {
    operatorRole.parentId = adminRole.id;
    await roleRepo.save(operatorRole);
    console.log('  🔗 设置 OPERATOR 继承 ADMIN');
  }

  // 创建权限
  console.log('📦 创建权限...');
  const savedPermissions: Map<string, Permission> = new Map();
  for (const permData of permissions) {
    const existing = await permissionRepo.findOne({
      where: { code: permData.code },
    });
    if (!existing) {
      const perm = permissionRepo.create({
        ...permData,
        status: PermissionStatus.ACTIVE,
      });
      const saved = await permissionRepo.save(perm);
      savedPermissions.set(saved.code, saved);
      console.log(`  ✅ 创建权限: ${permData.name} (${permData.code})`);
    } else {
      savedPermissions.set(existing.code, existing);
      console.log(`  ⏭️  权限已存在: ${permData.name} (${permData.code})`);
    }
  }

  // 设置权限父子关系
  console.log('📦 设置权限父子关系...');
  const menuCodes = [
    'user',
    'role',
    'permission',
    'client',
    'model',
    'provider',
    'analytics',
  ];
  for (const menuCode of menuCodes) {
    const menuPerm = savedPermissions.get(menuCode);
    if (menuPerm) {
      // 找到所有以 menuCode: 开头的权限
      for (const [code, perm] of savedPermissions) {
        if (code.startsWith(`${menuCode}:`) && !perm.parentId) {
          perm.parentId = menuPerm.id;
          await permissionRepo.save(perm);
        }
      }
    }
  }

  // 创建权限模板
  console.log('📦 创建权限模板...');
  for (const templateData of templates) {
    const existing = await templateRepo.findOne({
      where: { code: templateData.code },
    });
    if (!existing) {
      const template = templateRepo.create(templateData);
      await templateRepo.save(template);
      console.log(`  ✅ 创建模板: ${templateData.name} (${templateData.code})`);
    } else {
      console.log(
        `  ⏭️  模板已存在: ${templateData.name} (${templateData.code})`,
      );
    }
  }

  // 为 ADMIN 角色分配所有权限
  console.log('📦 为 ADMIN 角色分配权限...');
  if (adminRole) {
    const existingRolePerms = await rolePermissionRepo.find({
      where: { roleId: adminRole.id },
    });
    if (existingRolePerms.length === 0) {
      const rolePerms = Array.from(savedPermissions.values()).map((p) =>
        rolePermissionRepo.create({
          roleId: adminRole.id,
          permissionId: p.id,
        }),
      );
      await rolePermissionRepo.save(rolePerms);
      console.log(`  ✅ ADMIN 角色分配了 ${rolePerms.length} 个权限`);
    } else {
      console.log(`  ⏭️  ADMIN 角色已有权限配置`);
    }
  }

  console.log('✅ 权限数据初始化完成！');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ 初始化失败:', err);
  process.exit(1);
});
