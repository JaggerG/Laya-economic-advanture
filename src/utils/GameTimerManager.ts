export interface IProgressUpdater {
  update(): void;
}

export class GameTimerManager {
  private static instance: GameTimerManager;
  private isRunning: boolean = false;

  private progressUpdaters: Set<IProgressUpdater> = new Set();

  static getInstance(): GameTimerManager {
    if (!GameTimerManager.instance) {
      GameTimerManager.instance = new GameTimerManager();
    }
    return GameTimerManager.instance;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    Laya.timer.loop(100, this, this.onTick);
  }

  stop(): void {
    Laya.timer.clearAll(this);
    this.isRunning = false;
  }

  registerProgressUpdater(updater: IProgressUpdater): void {
    this.progressUpdaters.add(updater);
  }

  unregisterProgressUpdater(updater: IProgressUpdater): void {
    this.progressUpdaters.delete(updater);
  }

  private onTick(): void {
    this.progressUpdaters.forEach((updater) => updater.update());
  }
}
