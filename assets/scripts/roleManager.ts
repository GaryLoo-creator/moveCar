import { PoolManager } from "./PoolManager";
import { role as roleComponent } from "./role";

import { _decorator, geometry, Node, PhysicsSystem, Prefab, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("roleManager")
export class roleManager {
  rolePrefad: Prefab = null;
  roleLength: number = 0;
  roleRoot: Node = null;
  rolePool: PoolManager = null;
  /**
   * 初始化角色管理器
   * @param rolePrefad 人物预制体
   * @param roleLength 人物数量
   * @param roleRoot 人物根节点
   */
  init(rolePrefad: Prefab, roleLength: number, roleRoot: Node) {
    this.rolePrefad = rolePrefad;
    this.roleLength = roleLength;
    this.roleRoot = roleRoot;
    this.initRolePool();
    this.createRole();
  }
  /**
   * 初始化角色池
   */
  initRolePool() {
    this.rolePool = new PoolManager(this.rolePrefad, this.roleLength);
  }
  /**
   * 创建角色
   */
  createRole() {
    for (let i = 0; i < this.roleLength; i++) {
      let newRole = this.rolePool.get();
      newRole.active = false;
      this.roleRoot.insertChild(newRole, 0);
    }
  }
  /**
   * 更新人物移动位置
   */
  updateRolePos(dt: number) {
    this.roleRoot.children.forEach((role, index) => {
      const roleCom = role.getComponent(roleComponent);
      if (!role.active) {
        role.active = true;
        roleCom.isVerticalMove = true;
        roleCom.isHorizontalMove = false;
        role.setRotationFromEuler(0, 0, 0);
        role.setPosition(new Vec3(-8.866, 0, -7.526 - index * 2));
        roleCom.playAni("StandbyRole");
      }

      let rolePos = role.getPosition().clone();
      let forward = new Vec3(0, 0, -1); //初始z轴移动的基础距离
      if (roleCom.isHorizontalMove) {
        forward = new Vec3(-1, 0, 0);
      }
      const distance = forward.clone().multiplyScalar(0.04 * -25);
      rolePos.add(distance);

      const roleWorldPos = role.getWorldPosition();
      const rayCheck = new geometry.Ray(
        roleWorldPos.x,
        roleWorldPos.y,
        roleWorldPos.z,
        distance.x,
        distance.y,
        distance.z
      );
      const mask = 1 << 3;
      const isCollide = PhysicsSystem.instance.raycastClosest(
        rayCheck,
        mask,
        distance.length(),
        true
      );
      if (isCollide) {
        roleCom.playAni("StandbyRole");
        return;
      }

      if (roleCom.isVerticalMove && rolePos.z >= 0) {
        roleCom.isVerticalMove = false;
        roleCom.isHorizontalMove = true;
        role.setRotationFromEuler(0, 90, 0);
        role.setPosition(new Vec3(-8.866, 0, 0));
        roleCom.playAni("StandbyRole");
      } else if (roleCom.isHorizontalMove && rolePos.x >= 0) {
        roleCom.playAni("StandbyRole");
        role.setRotationFromEuler(0, 0, 0);
        return;
      }
      roleCom.playAni("Run");
      role.setPosition(rolePos);
    });
  }
  /**
   * 每帧调用
   */
  update() {}
}
