import { _decorator, Component, Enum, Node, tween, Vec3 } from "cc";
import { role as roleComponent } from "./role";
const { ccclass, property } = _decorator;

export enum carTyoe {
  Sedan = 4,
  Bus = 10,
  Minivan = 8,
}

@ccclass("car")
export class car extends Component {
  @property({ type: Enum(carTyoe) })
  carType: carTyoe = carTyoe.Minivan;

  maxSeatsLength: number;
  isRoleFull: boolean = false;
  curRoleNumber: number = 0; //当前角色上车数量
  start() {
    this.maxSeatsLength = this.carType;
  }
  /**
   *  人物上车
   */
  addRole(role: Node) {
    this.curRoleNumber++;

    let roleCom = role.getComponent(roleComponent);
    // Node.setParent() 方法的第二个参数是一个布尔值，表示是否保持节点在世界坐标系中的位置不变。
    // 当设置为 true 时，节点会保持其在世界空间中的位置、旋转和缩放不变，只改变其父节点关系。这意味着节点在屏幕上的视觉位置不会发生变化，即使父节点有不同的变换。
    role.setParent(
      this.node.getChildByName("seats").children[this.curRoleNumber - 1],
      true
    );
    roleCom.playAni("Run");
    tween(role)
      .to(0.5, { position: new Vec3(0, 0, 0) })
      .call(() => {
        role.setScale(0.7, 0.7, 0.7);
        role.setRotationFromEuler(0, 0, 0);
      })
      .start();

    this.isRoleFull = this.curRoleNumber == this.maxSeatsLength;

    return this.isRoleFull;
  }

  update(deltaTime: number) {}
}
