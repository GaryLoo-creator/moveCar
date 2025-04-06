import { _decorator, Component } from "cc";
import { car } from "./car";
const { ccclass, property } = _decorator;

@ccclass("parking")
export class parking extends Component {
  haveCar: boolean = false;

  car: car = null;
  start() {}

  update(deltaTime: number) {}
}
