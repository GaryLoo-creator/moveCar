import { _decorator, Component, SkeletalAnimation } from "cc";
const { ccclass, property } = _decorator;

/**
 * 从数组中随机获取一个元素
 * @param array 输入数组
 * @returns 随机选中的元素
 */
function getRandomElement<T>(array: T[]): T {
  if (!array || array.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export enum RoleAni {
  StandbyAni1 = "Idle", //待机动画1
  StandbyAni2 = "HappyIdle", //待机动画2
  StandbyAni3 = "HappyIdle1", //待机动画3
  StandbyAni4 = "SadIdle", //待机动画3
  SitAni1 = "SitLaughing", //坐着的动画1
  SitAni2 = "SitTalking", //坐着的动画2
  Run = "Run", //跑
}

export type stutusType = "Run" | "SitRole" | "StandbyRole";

@ccclass("role")
export class role extends Component {
  // 纵向移动
  isVerticalMove: Boolean = true;
  // 横向移动
  isHorizontalMove: Boolean = false;

  aniCom: SkeletalAnimation = null;
  aniName: RoleAni;
  curAniType: stutusType;
  onLoad() {
    this.aniCom = this.node.getComponent(SkeletalAnimation);
  }
  start() {}
  playAni(type: stutusType) {
    if (this.curAniType === type || !this.node.activeInHierarchy) {
      return;
    }
    this.curAniType = type;
    switch (type) {
      case "Run":
        this.aniName = RoleAni.Run;
        break;
      case "SitRole":
        this.aniName = getRandomElement([RoleAni.SitAni1, RoleAni.SitAni2]);
        break;
      case "StandbyRole":
        this.aniName = getRandomElement([
          RoleAni.StandbyAni1,
          RoleAni.StandbyAni2,
          RoleAni.StandbyAni3,
          RoleAni.StandbyAni4,
        ]);
        break;

      default:
        break;
    }

    this.aniCom.play(this.aniName);
  }

  update(deltaTime: number) {}
}
