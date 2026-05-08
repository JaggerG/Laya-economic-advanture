/**
 * 事件管理器模块
 * 基于 Laya.EventDispatcher 封装的全局事件管理单例类
 * 提供游戏内各模块间的解耦通信机制，支持事件的派发、监听和移除
 * 
 * 使用场景：
 * - UI 组件间的数据传递
 * - 游戏逻辑与视图更新的解耦
 * - 跨模块的状态通知
 */

import EventDispatcher = Laya.EventDispatcher;

class EventManager extends Laya.EventDispatcher {
  /** 内部事件派发器实例，用于实际的事件分发 */
  static eventDispatcher: EventDispatcher = new EventDispatcher();
  /** 单例实例引用 */
  static _instance: EventManager;

  constructor() {
    super();
  }

  /**
   * 获取 EventManager 单例实例
   * @returns EventManager 的唯一实例
   */
  public static getInstance() {
    if (EventManager._instance == null) {
      EventManager._instance = new EventManager();
    }
    return EventManager._instance;
  }

  /**
   * 派发全局事件
   * @param eventName - 事件名称
   * @param args - 可选的事件参数数组
   */
  public Emit(eventName: string, args?: any[]) {
    // console.log('派发事件', eventName,args);
    EventManager.eventDispatcher.event(eventName, args);
  }

  /**
   * 添加事件监听
   * @param eventName - 要监听的事件名称
   * @param caller - 事件回调的执行上下文（this 指向）
   * @param listener - 事件触发时执行的回调函数
   * @param args - 可选的附加参数，会在回调时传入
   */
  public Add(
    eventName: string,
    caller: any,
    listener: Function,
    args?: any[]
  ): void {
    // console.log('添加事件', eventName,args);
    EventManager.eventDispatcher.on(
      eventName,
      caller,
      listener,
      args == null ? null : [args]
    );
  }

  /**
   * 移除事件监听
   * @param eventName - 要移除监听的事件名称
   * @param caller - 事件回调的执行上下文
   * @param listener - 要移除的回调函数
   */
  public Off(eventName: string, caller: any, listener: Function): void {
    EventManager.eventDispatcher.off(eventName, caller, listener);
  }
}

export default EventManager;
