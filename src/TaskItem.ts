const { regClass, property } = Laya;
import userInfo from "./model/userInfo";
import Data from "./model/index";
import EventManager from "./utils/EventManager";
import lottery from "./utils/lottery";
import * as BN from "./utils/BigNumber";

@regClass()
export class TaskItem extends Laya.Script {
  @property({ type: Laya.Label })
  public desc_label: Laya.Label;
  @property({ type: Laya.Image })
  public task_image: Laya.Image;
  @property({ type: Laya.ProgressBar })
  public task_progress: Laya.ProgressBar;
  @property({ type: Laya.Sprite })
  public finish_img: Laya.Sprite;

  private cur_target_asset: any = null;
  private target_amount: string;
  private config: any;
  private s_c_amount: string = "0";
  private panel_idx: number;

  public initData(data: any) {
    this.config = data.config;
    this.panel_idx = data.panel_idx;
    this.target_amount = data.config.target;
    this.desc_label.text = data.config.desc;
    const cur_step = userInfo.Task.task_idx_config[this.panel_idx].step;
    if (
      this.config.type === 'COLLECT' || this.config.type === 'SPEND'
    ) {
      this.s_c_amount = cur_step.toString();
    }
    const target_asset_name = data.config.target_asset;
    if (target_asset_name === "Science") {
      this.cur_target_asset = { name: "Science" };
    } else if (target_asset_name === "Card") {
      this.cur_target_asset = { name: "Card" };
    } else {
      for (let i = 0; i < Data.Assets.length; i++) {
        if (Data.Assets[i].name === target_asset_name) {
          this.cur_target_asset = Data.Assets[i];
          return;
        } else {
          const asset_child = Data.Assets[i].child;
          for (let j = 0; j < asset_child.length; j++) {
            if (asset_child[j].name === target_asset_name) {
              this.cur_target_asset = asset_child[j];
              return;
            }
          }
        }
      }
    }
  }
  onStart() {
    this.initEvent();
    this.updateProgress();
  }
  initEvent() {
    console.log(this.cur_target_asset.name);
    const eventName = this.config.type !== "OWN"
      ? this.cur_target_asset.name + "_" + this.config.type + "_update"
      : this.cur_target_asset.name + "_update"
    EventManager.getInstance().Add(
      eventName,
      this,
      this.updateProgress
    );
    this.finish_img.on(Laya.Event.CLICK, this, this.handleFinishClick);
}
    initNextTask() {
        const cur_task_idx = userInfo.Task.task_idx_max;
        if (cur_task_idx + 1 < Data.Tasks[userInfo.level].config.length) {
            userInfo.Task.task_idx_max = cur_task_idx + 1;
            userInfo.Task.task_idx_config[this.panel_idx].idx = userInfo.Task.task_idx_max
            userInfo.Task.task_idx_config[this.panel_idx].step = 0
            const new_task_info = Data.Tasks[userInfo.level].config[cur_task_idx + 1]
            const task_data = {
                panel_idx: this.panel_idx,
                config: new_task_info
            }
            this.finish_img.visible = false;
            this.initData(task_data);
            this.initEvent();
            this.updateProgress();
        } else {
            this.owner.destroy();
        } 
    }
  handleFinishClick() {
    const c_min = this.config.reward.c_min;
    const c_max = this.config.reward.c_max;
    const total = lottery.getRandomInt(c_min, c_max);
    const atLeast = this.config.reward.atLeast;
    const cardInfo = lottery.drawCard(total, atLeast);
    const card_arr_info = lottery.collectCard(cardInfo);
    const s_min = this.config.reward.s_min;
    const s_max = this.config.reward.s_max;
    const scienceInfo = lottery.drawSciencePoint(s_min, s_max);

    this.initNextTask();
    console.log("动画数据");
    console.log(card_arr_info);
    console.log(scienceInfo);

    EventManager.getInstance().Emit("Card_COLLECT_update", [cardInfo.length]);
    setTimeout(() => {
      EventManager.getInstance().Emit("CardList_update", []);
    }, 500);
    userInfo.science_point += scienceInfo;
    EventManager.getInstance().Emit("Science_update", []);
    userInfo.Task.task_step++;
    EventManager.getInstance().Emit('task_progress_update');
  }
    updateProgress(data?: any) {
    if (data) {
      this.s_c_amount = BN.add(this.s_c_amount, data.toString());
    }
    let cur_val: number;
    if (
      this.config.type === 'COLLECT' || this.config.type === 'SPEND'
    ) {
      cur_val = parseFloat(BN.div(this.s_c_amount, this.target_amount));
      console.log("cur_val", cur_val);
    } else {
      cur_val = parseFloat(BN.div(this.cur_target_asset.amount, this.target_amount));
    }
    if (cur_val >= 1) {
      this.finish_img.visible = true;
      EventManager.getInstance().Off(
        this.cur_target_asset.name + "_" + this.config.type + "_update",
        this,
        this.updateProgress
      );
    } else {
      this.task_progress.value = cur_val;
    }
  }
}
