const { regClass, property,Browser } = Laya;
import Data from "./model/index";
import userInfo from './model/userInfo';
import { AssetItem } from "./AssetItem";
import { TaskItem } from './TaskItem'
import EventManager from "./utils/EventManager";
import Assets from "./utils/Assets";
import { GameTimerManager } from "./utils/GameTimerManager";
import { GameDataManager } from "./utils/GameDataManager";

@regClass()
export class Main extends Laya.Script {
  @property({ type: Laya.ViewStack })
  public viewStack: Laya.ViewStack;
  @property({ type: Laya.Prefab })
  public asset_item_prefab: Laya.Prefab;
  @property({ type: Laya.Box })
  public task_list_box: Laya.Box;
  @property({ type: Laya.Prefab })
  public task_item_prefab: Laya.Prefab;
  @property({ type: Laya.Label })
  public s_point_label: Laya.Label;
  @property({ type: Laya.ProgressBar })
  public task_progress:Laya.ProgressBar;

  onStart() {
    this.loadGameData();
    GameTimerManager.getInstance().start();
    this.initAssetPanel();
    this.initHeaderPanel();
    this.initUI();
    this.initEvent();
    this.startAutoSave();
  }

  loadGameData() {
    const gameDataMgr = GameDataManager.getInstance();
    const saveData = gameDataMgr.load();
    if (saveData) {
      gameDataMgr.restore(saveData);
      this.initCardProfit();
      const offlineResult = gameDataMgr.calculateOfflineEarnings(saveData);
      if (offlineResult.offlineSeconds > 0) {
        this.showOfflineRewardDialog(offlineResult, saveData);
      } else {
        gameDataMgr.checkOwnTasksAfterOffline();
      }
    }
  }

  showOfflineRewardDialog(result: any, saveData: any) {
    const hours = Math.floor(result.offlineSeconds / 3600);
    const minutes = Math.floor((result.offlineSeconds % 3600) / 60);
    let timeStr = "";
    if (hours > 0) timeStr += hours + "小时";
    if (minutes > 0) timeStr += minutes + "分钟";

    let rewardStr = "离线收益:\n";
    for (const [key, value] of result.earnings) {
      if (key === "Employee") {
        rewardStr += "员工: +" + Assets.convertToUnits(value) + "\n";
      } else {
        rewardStr += key + ": +" + Assets.convertToUnits(value) + "\n";
      }
    }

    const dialog = new Laya.Dialog();
    dialog.width = 400;
    dialog.height = 360;
    dialog.isPopupCenter = true;

    const bg = new Laya.Image();
    bg.skin = "comp/img_bg.png";
    bg.sizeGrid = "10,10,10,10";
    bg.width = 400;
    bg.height = 360;
    dialog.addChild(bg);

    const titleLabel = new Laya.Label();
    titleLabel.text = "欢迎回来!";
    titleLabel.fontSize = 28;
    titleLabel.color = "#FFD700";
    titleLabel.bold = true;
    titleLabel.centerX = 0;
    titleLabel.y = 20;
    dialog.addChild(titleLabel);

    const timeLabel = new Laya.Label();
    timeLabel.text = "离线时长: " + timeStr;
    timeLabel.fontSize = 20;
    timeLabel.color = "#FFFFFF";
    timeLabel.centerX = 0;
    timeLabel.y = 60;
    dialog.addChild(timeLabel);

    const rewardLabel = new Laya.Label();
    rewardLabel.text = rewardStr;
    rewardLabel.fontSize = 18;
    rewardLabel.color = "#FFFFFF";
    rewardLabel.centerX = 0;
    rewardLabel.y = 100;
    rewardLabel.align = "center";
    dialog.addChild(rewardLabel);

    const confirmBtn = new Laya.Button();
    confirmBtn.label = "确定";
    confirmBtn.width = 120;
    confirmBtn.height = 50;
    confirmBtn.centerX = -80;
    confirmBtn.y = 280;
    confirmBtn.on(Laya.Event.CLICK, this, () => {
      this.applyOfflineAndClose(dialog, result);
    });
    dialog.addChild(confirmBtn);

    const doubleBtn = new Laya.Button();
    doubleBtn.label = "看广告x2";
    doubleBtn.width = 120;
    doubleBtn.height = 50;
    doubleBtn.centerX = 80;
    doubleBtn.y = 280;
    doubleBtn.on(Laya.Event.CLICK, this, () => {
      this.watchAdForDouble(dialog, result, saveData);
    });
    dialog.addChild(doubleBtn);

    dialog.popup();
  }

  applyOfflineAndClose(dialog: Laya.Dialog, result: any): void {
    const gameDataMgr = GameDataManager.getInstance();
    gameDataMgr.applyOfflineEarnings(result);
    gameDataMgr.emitOfflineEarningsEvents(result);
    gameDataMgr.checkOwnTasksAfterOffline();
    dialog.close();
  }

  watchAdForDouble(dialog: Laya.Dialog, result: any, saveData: any): void {
    console.log("[Ad] 观看广告获取双倍离线收益");
    const gameDataMgr = GameDataManager.getInstance();
    const doubleResult = gameDataMgr.calculateOfflineEarnings(saveData, 2);
    gameDataMgr.applyOfflineEarnings(doubleResult);
    gameDataMgr.emitOfflineEarningsEvents(doubleResult);
    gameDataMgr.checkOwnTasksAfterOffline();
    dialog.close();
  }

  startAutoSave() {
    Laya.timer.loop(30000, this, () => {
      GameDataManager.getInstance().save();
    });
  }
  initEvent() {
    EventManager.getInstance().Add('Science_update', this, () => {
      this.s_point_label.text = userInfo.science_point.toString();
    })
  }
  initUI() {
    this.s_point_label.text = userInfo.science_point.toString();
  }
  initHeaderPanel() {
    this.task_progress.value = userInfo.Task.task_step / Data.Tasks[userInfo.level].config.length;
    EventManager.getInstance().Add('task_progress_update', this, () => {
      this.task_progress.value = userInfo.Task.task_step / Data.Tasks[userInfo.level].config.length;
    });
    const task_config = Data.Tasks[userInfo.Task.task_level].config
    const cur_task_config = userInfo.Task.task_idx_config;
    let cur_task = [];
    for (let i = 0; i < cur_task_config.length; i++){
      let task_idx = cur_task_config[i].idx;
      cur_task.push(task_config[task_idx]);
    }
    let offset = (Browser.clientWidth - cur_task.length * 100) / 4;
    for (let i = 0; i < cur_task.length; i++){
      let instance: Laya.Sprite = this.task_item_prefab.create() as Laya.Sprite;
      const data = {
        panel_idx: i,
        config: cur_task[i]
      }
      instance.getComponent(TaskItem).initData(data);
      this.task_list_box.addChild(instance);
      instance.x = i * 100 + offset*(i+1);
      instance.y = 20;
    }
  }
  initAssetPanel() {
    const view_num = this.viewStack.numChildren;
    for (let view_idx = 0; view_idx < Data.Assets.length; view_idx++) {
      let cur_view = this.viewStack.getChildAt(view_idx);
      for (
        let asset_idx = 0;
        asset_idx < Data.Assets[view_idx].child.length;
        asset_idx++
      ) {
        let instance: Laya.Sprite =
          this.asset_item_prefab.create() as Laya.Sprite;
        let assetItem = instance.getComponent(AssetItem);

        let bro = null;
        if (asset_idx !== 0) {
          bro = this.viewStack
            .getChildAt(view_idx)
            .getChildByName("asset_panels")
            .getChildAt(asset_idx - 1)
            .getComponent(AssetItem);
        }
        assetItem.data = {
          config: Data.Assets[view_idx].child[asset_idx],
          panel_idx: view_idx,
          asset_idx: asset_idx,
          bro,
        };
        let cur_asset_panel = this.viewStack
          .getChildAt(view_idx)
          .getChildByName("asset_panels");
        cur_asset_panel.addChild(instance);
        instance.x = 10;
        instance.y = asset_idx * 85 + 20;
      }
    }
  }
  initCardProfit() {
    userInfo.Card.forEach(card => {
      Data.Assets.forEach(asset => {
        asset.child.forEach(child => {
          if (child.name === card.related_assets) {
            const key = card.type as keyof typeof child.bonus
            let cur_bonus = child.bonus[key]
            cur_bonus.quantity = Math.pow(card.level_ratio, card.level).toString();
          }
        })
      })
    })
    console.log(Data.Assets);
  }
}
