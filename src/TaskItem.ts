/**
 * 任务项组件
 * 负责单个任务的展示、进度跟踪和完成处理
 * 支持多种任务类型：OWN（拥有）、COLLECT（收集）、SPEND（花费）
 * 
 * 核心功能：
 * - 任务描述和进度条展示
 * - 根据任务类型监听不同的事件更新进度
 * - 任务完成后派发奖励（卡牌、科学点数）
 * - 自动切换到下一个任务
 */

const { regClass, property } = Laya;
import userInfo from "./model/userInfo";
import Data from "./model/index";
import EventManager from "./utils/EventManager";
import lottery from "./utils/lottery";
import * as BN from "./utils/BigNumber";

@regClass()
export class TaskItem extends Laya.Script {
  /** 任务描述标签 */
  @property({ type: Laya.Label })
  public desc_label: Laya.Label;
  /** 任务图标 */
  @property({ type: Laya.Image })
  public task_image: Laya.Image;
  /** 任务进度条 */
  @property({ type: Laya.ProgressBar })
  public task_progress: Laya.ProgressBar;
  /** 完成按钮/图标 */
  @property({ type: Laya.Sprite })
  public finish_img: Laya.Sprite;

  /** 当前任务目标资产引用 */
  private cur_target_asset: any = null;
  /** 任务目标数量 */
  private target_amount: string;
  /** 任务配置 */
  private config: any;
  /** COLLECT/SPEND 类型任务的当前累计数量 */
  private s_c_amount: string = "0";
  /** 任务在面板中的索引 */
  private panel_idx: number;

  /**
   * 初始化任务数据
   * @param data - 包含 config（任务配置）和 panel_idx（面板索引）的对象
   * 
   * 初始化逻辑：
   * 1. 设置任务描述和目标数量
   * 2. 根据任务类型初始化累计数量（COLLECT/SPEND 类型需要累计）
   * 3. 查找目标资产引用（在 Data.Assets 或其子资产中搜索）
   */
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

  /**
   * 组件启动时调用
   * 初始化事件监听并更新进度显示
   */
  onStart() {
    this.initEvent();
    this.updateProgress();
  }

  /**
   * 初始化事件监听
   * 根据任务类型绑定对应的事件：
   * - COLLECT/SPEND 类型：监听 {assetName}_{type}_update 事件
   * - OWN 类型：监听 {assetName}_update 事件
   * 绑定完成按钮点击事件
   */
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

  /**
   * 初始化下一个任务
   * 当前任务完成后，尝试加载下一个任务配置
   * 如果没有更多任务，则销毁当前任务组件
   */
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

  /**
   * 处理任务完成点击
   * 
   * 奖励派发流程：
   * 1. 抽取随机数量的卡牌（c_min ~ c_max 张，至少 atLeast 张）
   * 2. 收集并去重卡牌，更新玩家卡牌库
   * 3. 抽取随机科学点数（s_min ~ s_max）
   * 4. 切换到下一个任务
   * 5. 派发相关更新事件
   */
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

  /**
   * 更新任务进度
   * @param data - 事件传递的数据（COLLECT/SPEND 类型为变化量）
   * 
   * 进度计算：
   * - COLLECT/SPEND 类型：累计变化量 / 目标数量
   * - OWN 类型：当前资产数量 / 目标数量
   * 
   * 当进度 >= 1 时，显示完成按钮并移除事件监听
   */
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
