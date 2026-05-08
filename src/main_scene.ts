/**
 * 主场景组件
 * 游戏的核心入口场景，负责初始化所有游戏系统和 UI 组件
 * 
 * 核心功能：
 * - 游戏存档的加载和离线收益处理
 * - 资产面板、任务面板、头部面板的初始化
 * - 自动存档定时器
 * - 离线收益弹窗展示（支持普通领取和广告双倍）
 * - 卡牌加成效果的初始化应用
 */

const { regClass, property,Browser } = Laya;
import Data from "./model/index";
import userInfo from './model/userInfo';
import { AssetItem } from "./AssetItem";
import { TaskItem } from './TaskItem'
import EventManager from "./utils/EventManager";
import Assets from "./utils/Assets";
import { GameTimerManager } from "./utils/GameTimerManager";
import { GameDataManager } from "./utils/GameDataManager";
import { LevelManager } from "./utils/LevelManager";

@regClass()
export class Main extends Laya.Script {
  /** 资产视图堆栈 */
  @property({ type: Laya.ViewStack })
  public viewStack: Laya.ViewStack;
  /** 资产项预制体 */
  @property({ type: Laya.Prefab })
  public asset_item_prefab: Laya.Prefab;
  /** 任务列表容器 */
  @property({ type: Laya.Box })
  public task_list_box: Laya.Box;
  /** 任务项预制体 */
  @property({ type: Laya.Prefab })
  public task_item_prefab: Laya.Prefab;
  /** 科学点数标签 */
  @property({ type: Laya.Label })
  public s_point_label: Laya.Label;
  /** 任务总进度条 */
  @property({ type: Laya.ProgressBar })
  public task_progress:Laya.ProgressBar;
  /** 等级标签 */
  @property({ type: Laya.Label })
  public level_label: Laya.Label;
  /** 经验值进度条 */
  @property({ type: Laya.ProgressBar })
  public exp_progress: Laya.ProgressBar;
  /** 经验值标签 */
  @property({ type: Laya.Label })
  public exp_label: Laya.Label;

  /**
   * 组件启动时调用
   * 按顺序初始化游戏的所有子系统
   */
  onStart() {
    this.loadGameData();
    GameTimerManager.getInstance().start();
    this.initAssetPanel();
    this.initHeaderPanel();
    this.initUI();
    this.initEvent();
    this.startAutoSave();
  }

  /**
   * 加载游戏存档数据
   * 
   * 加载流程：
   * 1. 从 localStorage 读取存档
   * 2. 恢复游戏状态
   * 3. 应用卡牌加成效果
   * 4. 计算离线收益
   * 5. 如果有离线收益，显示离线奖励弹窗；否则检查任务状态
   */
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

  /**
   * 显示离线收益弹窗
   * @param result - 离线收益计算结果
   * @param saveData - 存档数据（用于广告双倍计算）
   * 
   * 弹窗内容：
   * - 离线时长显示
   * - 各项资源收益明细
   * - "确定"按钮：普通领取
   * - "看广告x2"按钮：观看广告后领取双倍收益
   */
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

  /**
   * 应用离线收益并关闭弹窗
   * @param dialog - 弹窗实例
   * @param result - 离线收益结果
   */
  applyOfflineAndClose(dialog: Laya.Dialog, result: any): void {
    const gameDataMgr = GameDataManager.getInstance();
    gameDataMgr.applyOfflineEarnings(result);
    gameDataMgr.emitOfflineEarningsEvents(result);
    gameDataMgr.checkOwnTasksAfterOffline();
    dialog.close();
  }

  /**
   * 观看广告获取双倍离线收益
   * @param dialog - 弹窗实例
   * @param result - 原始离线收益结果
   * @param saveData - 存档数据
   * 
   * 使用 multiplier = 2 重新计算离线收益，然后应用
   */
  watchAdForDouble(dialog: Laya.Dialog, result: any, saveData: any): void {
    console.log("[Ad] 观看广告获取双倍离线收益");
    const gameDataMgr = GameDataManager.getInstance();
    const doubleResult = gameDataMgr.calculateOfflineEarnings(saveData, 2);
    gameDataMgr.applyOfflineEarnings(doubleResult);
    gameDataMgr.emitOfflineEarningsEvents(doubleResult);
    gameDataMgr.checkOwnTasksAfterOffline();
    dialog.close();
  }

  /**
   * 启动自动存档定时器
   * 每30秒自动保存一次游戏数据到 localStorage
   */
  startAutoSave() {
    Laya.timer.loop(30000, this, () => {
      GameDataManager.getInstance().save();
    });
  }

  /**
   * 初始化全局事件监听
   * 监听 Science_update 事件更新科学点数显示
   */
  initEvent() {
    EventManager.getInstance().Add('Science_update', this, () => {
      this.s_point_label.text = userInfo.science_point.toString();
    });
    EventManager.getInstance().Add('Exp_update', this, this.updateLevelUI);
    EventManager.getInstance().Add('LevelUp', this, this.onLevelUp);
  }

  /**
   * 更新等级和 EXP UI 显示
   */
  updateLevelUI() {
    const levelMgr = LevelManager.getInstance();
    const progress = levelMgr.getExpProgress();
    this.level_label.text = "Lv." + userInfo.level;
    this.exp_progress.value = progress.required > 0 ? progress.current / progress.required : 0;
    this.exp_label.text = progress.current + "/" + progress.required;
  }

  /**
   * 等级提升处理
   * @param newLevel - 新等级
   */
  onLevelUp(newLevel: number) {
    this.updateLevelUI();
    const levelMgr = LevelManager.getInstance();
    const title = levelMgr.getLevelTitle(newLevel);

    const dialog = new Laya.Dialog();
    dialog.width = 300;
    dialog.height = 200;
    dialog.isPopupCenter = true;

    const bg = new Laya.Image();
    bg.skin = "comp/img_bg.png";
    bg.sizeGrid = "10,10,10,10";
    bg.width = 300;
    bg.height = 200;
    dialog.addChild(bg);

    const titleLabel = new Laya.Label();
    titleLabel.text = "升级啦！";
    titleLabel.fontSize = 28;
    titleLabel.color = "#FFD700";
    titleLabel.bold = true;
    titleLabel.centerX = 0;
    titleLabel.y = 30;
    dialog.addChild(titleLabel);

    const contentLabel = new Laya.Label();
    contentLabel.text = "恭喜达到 Lv." + newLevel + "\n" + title;
    contentLabel.fontSize = 20;
    contentLabel.color = "#FFFFFF";
    contentLabel.centerX = 0;
    contentLabel.y = 80;
    contentLabel.align = "center";
    dialog.addChild(contentLabel);

    const confirmBtn = new Laya.Button();
    confirmBtn.label = "确定";
    confirmBtn.width = 100;
    confirmBtn.height = 40;
    confirmBtn.centerX = 0;
    confirmBtn.y = 140;
    confirmBtn.on(Laya.Event.CLICK, this, () => {
      dialog.close();
    });
    dialog.addChild(confirmBtn);

    dialog.popup();
  }

  /**
   * 初始化 UI 显示
   * 设置科学点数的初始显示值
   */
  initUI() {
    this.s_point_label.text = userInfo.science_point.toString();
    this.updateLevelUI();
  }

  /**
   * 初始化头部任务面板
   * 
   * 初始化流程：
   * 1. 计算任务总进度
   * 2. 获取当前显示的任务配置
   * 3. 动态创建任务项并添加到任务列表
   * 4. 根据屏幕宽度计算任务项的水平间距
   */
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

  /**
   * 初始化资产面板
   * 
   * 为每个父资产的每个子资产创建 AssetItem 组件：
   * 1. 遍历所有父资产（Data.Assets）
   * 2. 为每个子资产实例化预制体
   * 3. 设置组件数据（配置、索引、兄弟组件引用）
   * 4. 将组件添加到对应的面板容器中
   * 
   * 兄弟组件引用（bro）用于产出时的联动更新
   */
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

  /**
   * 初始化卡牌加成效果
   * 
   * 遍历玩家拥有的所有卡牌，将卡牌的等级加成应用到对应的资产 bonus 上
   * 加成计算公式：bonus.quantity = level_ratio ^ card.level
   * 
   * 例如：level_ratio = 2，card.level = 3，则 bonus.quantity = 8
   */
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
