import { _decorator, Node, tween, Tween, Vec3 } from "cc";
const { ccclass, property } = _decorator;

type towardsType = {
  top: Vec3 | null;
  bottom: Vec3 | null;
  left: Vec3 | null;
  right: Vec3 | null;
};

@ccclass("carTween")
export class carTween {
  carNode: Node = null;
  carTween: Tween<Node> = null;
  leftTowards: Vec3 = null;
  rightTowards: Vec3 = null;
  towardsType: towardsType = {
    top: null,
    bottom: null,
    left: null,
    right: null,
  };
  constructor(
    carNode: Node,
    rightFixedPointWorldPos: Vec3,
    leftFixedPointWorldPos: Vec3,
    rightBottomFixedPointWorldPos: Vec3,
    leftBottomFixedPointWorldPos: Vec3
  ) {
    this.carNode = carNode;
    this.towardsType.right = rightFixedPointWorldPos
      .clone()
      .subtract(leftFixedPointWorldPos.clone())
      .normalize();
    this.towardsType.left = leftFixedPointWorldPos
      .clone()
      .subtract(rightFixedPointWorldPos.clone())
      .normalize();
    this.towardsType.bottom = (() => {
      console.log(this.carNode.getWorldPosition());
      const curPos = this.carNode.getWorldPosition();
      const distanceRight = Vec3.distance(
        curPos,
        rightFixedPointWorldPos.clone()
      );
      const distanceLeft = Vec3.distance(
        curPos,
        leftFixedPointWorldPos.clone()
      );
      let forward: Vec3 = null;
      if (distanceRight < distanceLeft) {
        forward = rightBottomFixedPointWorldPos
          .clone()
          .subtract(rightFixedPointWorldPos.clone())
          .normalize();
      } else {
        forward = leftBottomFixedPointWorldPos
          .clone()
          .subtract(leftFixedPointWorldPos.clone())
          .normalize();
      }
      return forward;
    })();
    this.carTween = tween(carNode);
  }
  hitPointTowards(
    hitpoint: Vec3,
    fixedPointWorldPos: Vec3,
    towardsType: string
  ) {
    this.carTween
      .to(1, { worldPosition: hitpoint })
      .call(() => {
        const turnWard = hitpoint
          .clone()
          .subtract(fixedPointWorldPos)
          .normalize();
        // let turnWard = null;
        //   switch (towardsType) {
        //     case "right":
        //       turnWard = { x: 0, y: 0, z: 1 }
        //       break;
        //     case "left":
        //       turnWard = { x: 0, y: 0, z: 1 }
        //       break;
        //     case "bottom":
        //       this.carNode.forward = this.towardsType.bottom;
        //       break;
        //   }
        const _forwoad = this.carNode.forward.clone();
        const rotweenAni = tween(_forwoad);
        rotweenAni
          .to(
            0.1,
            { x: turnWard.x, y: turnWard.y, z: turnWard.z },
            // { x: 0, y: 0, z: 1 },
            {
              onUpdate: () => {
                this.carNode.forward = _forwoad;
              },
            }
          )
          .start();
      })
      .delay(0.2);
  }
  fixedPointTowards(fixedPointWorldPos: Vec3, towardsType: string) {
    this.carTween
      .to(1, { worldPosition: fixedPointWorldPos })
      .call(() => {
        const turnWard = this.towardsType[towardsType];
        const _forwoad = this.carNode.forward.clone();
        const rotweenAni = tween(_forwoad);
        rotweenAni
          .to(
            0.1,
            { x: turnWard.x, y: turnWard.y, z: turnWard.z },
            {
              onUpdate: () => {
                this.carNode.forward = _forwoad;
              },
            }
          )
          .start();
      })
      .delay(0.2);
  }
  parkingBottomTowards(parkNode: Node, fixedPointWorldPos: Vec3) {
    this.carTween
      .to(1, {
        worldPosition: new Vec3(
          parkNode.getWorldPosition().clone().x - 2.9,
          fixedPointWorldPos.y,
          fixedPointWorldPos.z
        ),
      })
      .call(() => {
        const parkPos = parkNode.getWorldPosition();
        const turnWard = this.carNode
          .getWorldPosition()
          .subtract(parkPos)
          .normalize();
        // const turnWard = this.carNode
        //   .getWorldPosition()
        //   .subtract(parkNode.getWorldPosition())
        //   .normalize();
        const _forwoad = this.carNode.forward.clone();
        const rotweenAni = tween(_forwoad);
        rotweenAni
          .to(
            0.1,
            { x: turnWard.x, y: turnWard.y, z: turnWard.z },
            {
              onUpdate: () => {
                this.carNode.forward = _forwoad;
              },
            }
          )
          .start();
      })
      .delay(0.2);
  }
  enterParking(parkNode: Node) {
    this.carTween.to(1, {
      worldPosition: new Vec3(
        parkNode.getWorldPosition().x,
        this.carNode.getWorldPosition().y, // 保持车辆的高度不变
        parkNode.getWorldPosition().z
      ),
    });
  }
  start(callBack: Function) {
    this.carTween.call(callBack);
    this.carTween.start();
  }
}
