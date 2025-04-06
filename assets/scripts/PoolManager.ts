// PoolManager.ts
import { _decorator, instantiate, Node, Prefab } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PoolManager")
export class PoolManager {
  private pool: Node[] = [];
  private prefab: Prefab;
  private initialSize: number;

  constructor(prefab: Prefab, initialSize: number) {
    this.prefab = prefab;
    this.initialSize = initialSize;
    // 使用特定数量的对象初始化池
    for (let i = 0; i < initialSize; i++) {
      let newObj = instantiate(prefab);
      newObj.active = false;
      this.pool.push(newObj);
    }
  }

  // 从池中获取对象
  public get(): Node {
    let obj: Node;
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
      obj.active = true;
    } else {
      obj = instantiate(this.prefab);
    }
    return obj;
  }

  // 将对象返回到池中
  public put(obj: Node): void {
    obj.active = false;
    this.pool.push(obj);
  }

  // 清理对象池
  public clear(): void {
    this.pool.forEach((obj) => {
      obj.destroy();
    });
    this.pool.length = 0;
  }

  // 调整池大小（如果需要，添加更多对象）
  public resize(newSize: number): void {
    let currentSize = this.pool.length;
    if (newSize > currentSize) {
      for (let i = currentSize; i < newSize; i++) {
        let newObj = instantiate(this.prefab);
        newObj.active = false;
        this.pool.push(newObj);
      }
    } else if (newSize < currentSize) {
      for (let i = currentSize - 1; i >= newSize; i--) {
        let obj = this.pool.pop();
        obj!.destroy();
      }
    }
  }

  // 获取池的当前大小
  public size(): number {
    return this.pool.length;
  }
}
