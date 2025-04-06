import { _decorator, Component, Enum } from "cc";
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
  start() {
    this.maxSeatsLength = this.carType;
  }
  /**
   *  人物上车
   */
  addRole(role: Node) {}

  update(deltaTime: number) {}
}
