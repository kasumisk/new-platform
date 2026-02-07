import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole as EntityUserRole } from '../../entities/user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { Role } from '../../entities/role.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersQueryDto,
  ResetPasswordDto,
} from '../dto/user-management.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * 获取用户列表（分页）
   */
  async findAll(query: GetUsersQueryDto) {
    const { page = 1, pageSize = 10, keyword, role, status } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // 搜索条件
    if (keyword) {
      queryBuilder.andWhere(
        '(user.username LIKE :keyword OR user.email LIKE :keyword OR user.nickname LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // 排序
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    // 获取所有用户的 RBAC 角色
    const userIds = list.map((u) => u.id);
    console.log('[AdminUserService] 查询用户角色, userIds:', userIds);

    const userRoles = await this.userRoleRepository.find({
      where: { userId: In(userIds) },
      relations: ['role'],
    });
    console.log('[AdminUserService] 找到用户角色关联:', userRoles.length);

    // 构建用户ID到角色的映射
    const userRolesMap = new Map<string, any[]>();
    userRoles.forEach((ur) => {
      if (ur.role) {
        const existing = userRolesMap.get(ur.userId) || [];
        existing.push({
          id: ur.role.id,
          code: ur.role.code,
          name: ur.role.name,
        });
        userRolesMap.set(ur.userId, existing);
      }
    });
    console.log(
      '[AdminUserService] 用户角色映射:',
      Array.from(userRolesMap.entries()),
    );

    // 移除密码字段并添加角色信息
    const sanitizedList = list.map((user) => {
      const { password, ...rest } = user;
      const rbacRoles = userRolesMap.get(user.id) || [];
      console.log(
        `[AdminUserService] 用户 ${user.username} 的角色:`,
        rbacRoles,
      );
      return {
        ...rest,
        rbacRoles,
      };
    });

    return {
      list: sanitizedList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取用户详情
   */
  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 #${id} 不存在`);
    }

    const { password, ...rest } = user;
    return rest;
  }

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto) {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('用户名已存在');
      }
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('邮箱已存在');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role as any as EntityUserRole,
      nickname: createUserDto.nickname,
      phone: createUserDto.phone,
      isAdmin: createUserDto.role === 'admin',
    });

    const savedUser = await this.userRepository.save(user);

    const { password: _, ...rest } = savedUser;
    return rest;
  }

  /**
   * 更新用户
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 #${id} 不存在`);
    }

    // 检查邮箱是否被其他用户使用
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    // 如果更新角色，同步更新 isAdmin 字段
    if (updateUserDto.role) {
      user.isAdmin = updateUserDto.role === 'admin';
    }

    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);

    const { password, ...rest } = updatedUser;
    return rest;
  }

  /**
   * 删除用户
   */
  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 #${id} 不存在`);
    }

    // 不允许删除超级管理员
    if (user.username === 'admin') {
      throw new BadRequestException('不能删除超级管理员账户');
    }

    await this.userRepository.remove(user);

    return { message: '用户删除成功' };
  }

  /**
   * 重置密码
   */
  async resetPassword(id: string, resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 #${id} 不存在`);
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    return { message: '密码重置成功' };
  }

  /**
   * 获取用户的角色列表
   */
  async getUserRoles(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`用户 #${userId} 不存在`);
    }

    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    return {
      userId,
      roles: userRoles
        .filter((ur) => ur.role)
        .map((ur) => ({
          id: ur.role.id,
          code: ur.role.code,
          name: ur.role.name,
        })),
    };
  }

  /**
   * 为用户分配角色
   */
  async assignRoles(userId: string, roleIds: string[]) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`用户 #${userId} 不存在`);
    }

    // 验证角色是否存在
    if (roleIds.length > 0) {
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
      });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('部分角色不存在');
      }
    }

    // 删除现有的用户角色关联
    await this.userRoleRepository.delete({ userId });

    // 创建新的用户角色关联
    if (roleIds.length > 0) {
      const userRoles = roleIds.map((roleId) =>
        this.userRoleRepository.create({ userId, roleId }),
      );
      await this.userRoleRepository.save(userRoles);
    }

    // 更新用户的 isAdmin 字段
    const adminRoles = await this.roleRepository.find({
      where: { id: In(roleIds), code: In(['SUPER_ADMIN', 'ADMIN']) },
    });
    user.isAdmin = adminRoles.length > 0;
    await this.userRepository.save(user);

    return { message: '角色分配成功' };
  }
}
