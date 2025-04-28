import EventDispatcher = Laya.EventDispatcher;
class EventManager extends Laya.EventDispatcher {
  static eventDispatcher: EventDispatcher = new EventDispatcher();
  static _instance: EventManager;
  constructor() {
    super();
  }
  public static getInstance() {
    if (EventManager._instance == null) {
      EventManager._instance = new EventManager();
    }
    return EventManager._instance;
  }

  public Emit(eventName: string, args?: any[]) {
    // console.log('派发事件', eventName,args);
    EventManager.eventDispatcher.event(eventName, args);
  }

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

  public Off(eventName: string, caller: any, listener: Function): void {
    EventManager.eventDispatcher.off(eventName, caller, listener);
  }
}

export default EventManager;
