const { regClass, property,Browser } = Laya;
import Data from "./model/index";
import userInfo from './model/userInfo';
import { AssetItem } from "./AssetItem";
import { TaskItem } from './TaskItem'
import EventManager from "./utils/EventManager";

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
    // 初始化卡牌加成
    this.initCardProfit();
    // 初始化
    this.initAssetPanel();
    // 初始化HeaderPanel();
    this.initHeaderPanel();
    // 初始化UI
    this.initUI();
    this.initEvent();

  }
  // 初始化事件
  initEvent() {
    EventManager.getInstance().Add('Science_update', this, () => {
      this.s_point_label.text = userInfo.science_point.toString();
    })
  }
  // 初始化UI
  initUI() {
    this.s_point_label.text = userInfo.science_point.toString();
  }
  // 初始化HeaderPanel();
  initHeaderPanel() {
    // 任务总进度
    this.task_progress.value = userInfo.Task.task_step / Data.Tasks[userInfo.level].config.length;
    EventManager.getInstance().Add('task_progress_update', this, () => {
      this.task_progress.value = userInfo.Task.task_step / Data.Tasks[userInfo.level].config.length;
    });
    // 任务tab
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
      // TODO: 动态摆放位置
      instance.x = i * 100 + offset*(i+1);
      instance.y = 20;
    }
  }
  // 初始化AssetPanel
  initAssetPanel() {
    const view_num = this.viewStack.numChildren;
    for (let view_idx = 0; view_idx < Data.Assets.length; view_idx++) {
      // 获取当前view
      let cur_view = this.viewStack.getChildAt(view_idx);
      // 将prefb放到对应的view
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
        // 添加到对应场景节点
        let cur_asset_panel = this.viewStack
          .getChildAt(view_idx)
          .getChildByName("asset_panels");
        cur_asset_panel.addChild(instance);
        // 设置位置
        instance.x = 10;
        instance.y = asset_idx * 85 + 20;
      }
    }
  }
  // 初始化卡牌加成
  initCardProfit() {
    userInfo.Card.forEach(card => {
      Data.Assets.forEach(asset => {
        asset.child.forEach(child => {
          if (child.name === card.related_assets) {
            // string 不能作为索引，转换一下类型
            const key = card.type as keyof typeof child.bonus
            let cur_bonus = child.bonus[key]
            cur_bonus.quantity = Math.pow(card.level_ratio, card.level);
          }
        })
      })
    })
    console.log(Data.Assets);
  }
}
