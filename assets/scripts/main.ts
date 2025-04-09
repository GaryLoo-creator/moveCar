import {
  _decorator,
  Component,
  geometry,
  Node,
  PhysicsSystem,
  Prefab,
  Vec3,
} from "cc";
import { car } from "./car";
import { carTween } from "./carTween";
import { parking } from "./parking";
import { roleManager } from "./roleManager";
const { ccclass, property } = _decorator;

// 开启物理系统的调试绘制2D
// PhysicsSystem.instance.debugDrawFlags =
//   EPhysics2DDrawFlags.Aabb |
//   EPhysics2DDrawFlags.Pair |
//   EPhysics2DDrawFlags.CenterOfMass |
//   EPhysics2DDrawFlags.Joint |
//   EPhysics2DDrawFlags.Shape;

// 开启物理系统的调试绘制3D
// PhysicsSystem.instance.debugDrawFlags =
//   EPhysicsDrawFlags.WIRE_FRAME |
//   EPhysicsDrawFlags.AABB |
//   EPhysicsDrawFlags.CONSTRAINT;

@ccclass("main")
export class main extends Component {
  @property(Node)
  roleRoot: Node = null;
  @property(Prefab)
  rolePrefad: Prefab = null;

  roleManager: roleManager = null;
  start() {
    this.roleManager = new roleManager();
    this.roleManager.init(
      this.rolePrefad,
      30,
      this.roleRoot,
      this.node.getChildByName("parkingSpace")
    );
    this.scheduleOnce(() => {
      this.roleManager.isArrowRoleUpdate = true;
    }, 3);

    this.carMove();
  }

  update(deltaTime: number) {
    this.roleManager.update(deltaTime);
  }

  carMove() {
    const carNode = this.node.getChildByName("bus");
    const carPos = carNode.getWorldPosition();
    const forWord = carNode.forward.clone().multiplyScalar(-1);
    const ray = new geometry.Ray(
      carPos.x,
      carPos.y,
      carPos.z,
      forWord.x,
      forWord.y,
      forWord.z
    );
    const mark = 1 << 2;
    const isHit = PhysicsSystem.instance.raycastClosest(ray, mark, 100, true);
    if (isHit) {
      const rightFixedPointWorldPos = this.node
        .getChildByPath("walls/top/rightFixedPoint")
        .getWorldPosition();
      const leftFixedPointWorldPos = this.node
        .getChildByPath("walls/top/leftFIxedPoint")
        .getWorldPosition();
      const rightBottomFixedPointWorldPos = this.node
        .getChildByPath("walls/bottom/rightBottomFixedPoint")
        .getWorldPosition();
      const leftBottomFixedPointWorldPos = this.node
        .getChildByPath("walls/bottom/leftBottomFIxedPoint")
        .getWorldPosition();
      const parkingSpaceNode = this.node.getChildByName("parkingSpace");
      const parkNode = parkingSpaceNode.children[2];
      console.log("parkNode", parkNode);
      const res = PhysicsSystem.instance.raycastClosestResult;
      console.log(res);
      const hitpoint = res.hitPoint; //碰到的最近碰撞体坐标
      const hitType = res.collider.node.name; //碰到的最近碰撞体名称
      const tweenAni = new carTween(
        carNode,
        rightFixedPointWorldPos,
        leftFixedPointWorldPos,
        rightBottomFixedPointWorldPos,
        leftBottomFixedPointWorldPos
      );

      if (hitType === "left" || hitType === "right") {
        const fixedPointWorldPos =
          hitType === "left" ? leftFixedPointWorldPos : rightFixedPointWorldPos;
        tweenAni.hitPointTowards(hitpoint, fixedPointWorldPos, hitType);
        tweenAni.fixedPointTowards(fixedPointWorldPos, hitType);
        tweenAni.parkingBottomTowards(parkNode, fixedPointWorldPos);
      } else if (hitType === "top") {
        let fixedPointWorldPos: Vec3 = null;
        // 判断目标节点是在当前节点的左边还是右边
        // 获取当前节点(碰撞点)的右向量
        const rightDir = res.collider.node.right;

        // 获取当前节点(碰撞点)位置
        const currentPos = hitpoint.clone();
        // 计算从当前节点到目标位置的向量
        const toTargetVec = parkNode.getWorldPosition().subtract(currentPos);
        // 计算点积
        // - 正值：两个向量指向大致相同的方向（夹角小于90度）
        // - 零值：两个向量互相垂直（夹角等于90度）
        // - 负值：两个向量指向大致相反的方向（夹角大于90度）
        const dotProduct = rightDir.dot(toTargetVec);

        // 计算点积，如果小于0，表示目标在左边
        if (dotProduct < 0) {
          fixedPointWorldPos = leftFixedPointWorldPos;
        } else {
          fixedPointWorldPos = rightFixedPointWorldPos;
        }

        tweenAni.hitPointTowards(hitpoint, fixedPointWorldPos, hitType);
        tweenAni.parkingBottomTowards(parkNode, fixedPointWorldPos);
      } else if (hitType === "bottom") {
        // 计算碰撞点与左右固定点的距离，选择距离更近的点作为目标点
        const distanceRight = Vec3.distance(
          hitpoint,
          rightFixedPointWorldPos.clone()
        );
        const distanceLeft = Vec3.distance(
          hitpoint,
          leftFixedPointWorldPos.clone()
        );
        let targetFixedPointWorldPos: Vec3 = null;
        let fixedPointWorldPos: Vec3 = null;
        let targetType: string = null;
        if (distanceRight < distanceLeft) {
          targetType = "right";
          targetFixedPointWorldPos = rightBottomFixedPointWorldPos;
          fixedPointWorldPos = rightFixedPointWorldPos;
        } else {
          targetType = "left";
          targetFixedPointWorldPos = leftBottomFixedPointWorldPos;
          fixedPointWorldPos = leftFixedPointWorldPos;
        }
        tweenAni.hitPointTowards(hitpoint, targetFixedPointWorldPos, hitType);
        tweenAni.fixedPointTowards(targetFixedPointWorldPos, hitType);
        tweenAni.fixedPointTowards(fixedPointWorldPos, targetType);
        tweenAni.parkingBottomTowards(parkNode, fixedPointWorldPos);
      }
      tweenAni.enterParking(parkNode);
      tweenAni.start(() => {
        carNode.setParent(parkNode, true);
        carNode.getChildByName("arrow").active = false;
        carNode.getChildByPath("Bus_01_White/top.003").active = false;
        // 设置停车位状态
        parkNode.getComponent(parking).haveCar = true;
        parkNode.getComponent(parking).car = carNode.getComponent(car);
      });
    }
  }

  // 判断哪个底部目标节点离碰撞点更近
  private getCloserNodePos(
    referenceNodePos: Vec3,
    nodeAPos: Vec3,
    nodeBPos: Vec3
  ): Vec3 {
    const refPos = referenceNodePos.clone();
    const posA = nodeAPos.clone();
    const posB = nodeBPos.clone();

    const distanceA = Vec3.distance(refPos, posA);
    const distanceB = Vec3.distance(refPos, posB);

    return distanceA < distanceB ? posA : posB;
  }

  oldcode() {
    // const tweenAni = tween(carNode);
    //   tweenAni
    // 找到碰撞点然后移动到碰撞点
    //     .to(1, { worldPosition: hitpoint })
    //     .call(() => {
    //       const turnWard = hitpoint
    //         .subtract(rightFixedPointWorldPos)
    //         .normalize();
    //       const _forwoad = carNode.forward.clone();
    //       const rotweenAni = tween(_forwoad);
    //       rotweenAni
    //         .to(
    //           0.1,
    //           { x: turnWard.x, y: turnWard.y, z: turnWard.z },
    //           {
    //             onUpdate: () => {
    //               carNode.forward = _forwoad;
    //             },
    //           }
    //         )
    //         .start();
    //     })
    //     .delay(0.2)
    // 移动到固定点
    //     .to(1, { worldPosition: rightFixedPointWorldPos })
    //     .call(() => {
    //       const turnWard = rightFixedPointWorldPos
    //         .subtract(leftFixedPointWorldPos)
    //         .normalize();
    //       const _forwoad = carNode.forward.clone();
    //       const rotweenAni = tween(_forwoad);
    //       rotweenAni
    //         .to(
    //           0.1,
    //           { x: turnWard.x, y: turnWard.y, z: turnWard.z },
    //           {
    //             onUpdate: () => {
    //               carNode.forward = _forwoad;
    //             },
    //           }
    //         )
    //         .start();
    //     })
    //     .delay(0.2)
    // 移动到停车场下方的位置
    //     .to(1, {
    //       worldPosition: new Vec3(
    //         parkNode.getWorldPosition().clone().x - 2.9,
    //         rightFixedPointWorldPos.y,
    //         rightFixedPointWorldPos.z
    //       ),
    //     })
    //     .call(() => {
    //       const turnWard = carNode
    //         .getWorldPosition()
    //         .subtract(parkNode.getWorldPosition())
    //         .normalize();
    //       const _forwoad = carNode.forward.clone();
    //       const rotweenAni = tween(_forwoad);
    //       rotweenAni
    //         .to(
    //           0.1,
    //           { x: turnWard.x, y: turnWard.y, z: turnWard.z },
    //           {
    //             onUpdate: () => {
    //               carNode.forward = _forwoad;
    //             },
    //           }
    //         )
    //         .start();
    //     })
    //     .delay(0.2)
    // 移动到停车场
    //     .to(1, {
    //       worldPosition: new Vec3(
    //         parkNode.getWorldPosition().x,
    //         carNode.getWorldPosition().y, // 保持车辆的高度不变
    //         parkNode.getWorldPosition().z
    //       ),
    //     })
    //     .start();
  }
}
