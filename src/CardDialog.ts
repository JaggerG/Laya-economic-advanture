/**
 * 卡牌详情弹窗组件
 * 展示单张卡牌的详细信息，包括收集进度、升级条件和升级操作
 * 当玩家点击已解锁的卡牌时弹出此对话框
 * 
 * 核心功能：
 * - 显示卡牌名称和描述
 * - 展示当前收集进度和升级所需数量
 * - 提供卡牌升级功能（消耗科学点数）
 */

import EventManager from "./utils/EventManager";
import Data from "./model/index";
import userInfo from "./model/userInfo";

const { regClass, property } = Laya;

@regClass()
export class CardDialog extends Laya.Script {
  /** 收集进度条 */
  @property({ type: Laya.ProgressBar })
  public collect_progress: Laya.ProgressBar;
  /** 关闭按钮 */
  @property({ type: Laya.Image })
  public close_img: Laya.Image;
  /** 升级按钮 */
  @property({ type: Laya.Button })
  public upgrade_btn: Laya.Button;
  /** 卡牌名称标签 */
  @property({ type: Laya.Label })
  public card_name_label: Laya.Label;
  /** 卡牌描述标签 */
  @property({ type: Laya.Label })
  public card_des_label: Laya.Label;
  /** 收集进度文本标签 */
  @property({ type: Laya.Label })
  public card_collect_progress_label: Laya.Label;
  /** 收集提示标签（显示还需多少张） */
  @property({ type: Laya.Label })
  public collect_tip_label: Laya.Label;

  /** 卡牌配置信息 */
  private card_info: any;
  /** 玩家拥有的该卡牌信息 */
  private user_info: any;

  /**
   * 初始化弹窗数据
   * @param data - 包含 card_info（卡牌配置）和 user_info（玩家卡牌数据）的对象
   * 
   * 界面状态判断：
   * - 如果当前拥有数量 > 升级目标数量：显示升级按钮
   * - 否则：显示进度条和还需收集的数量提示
   */
  public initData(data: any) {
    this.card_info = data.card_info;
    this.user_info = data.user_info;
    console.log(this.user_info);
    console.log(this.card_info);
    this.card_name_label.text = this.card_info.name;
    this.card_des_label.text = this.card_info.description || "card description";

    const cur_card = this.user_info;
    const cur_card_amount = cur_card.has_amount;
    const cur_level = cur_card.level;
    const cur_level_card_target = Data.Cards_Level_Target[cur_level];
    const cur_level_point = Data.Cards_Upgrade_Point[cur_level];
    if (cur_card_amount >= cur_level_card_target) {
      this.collect_progress.visible = false;
      this.upgrade_btn.visible = true;
      this.upgrade_btn.label = cur_level_point.toString();
    } else {
      this.collect_tip_label.text =
        "再收集" +
        (cur_level_card_target - cur_card_amount) +
        "张" +
        (cur_level == 0 ? "解锁" : "升级");
      this.card_collect_progress_label.text =
        cur_card_amount + "/" + cur_level_card_target;
      this.collect_progress.visible = true;
      this.upgrade_btn.visible = false;
    }
  }

  /**
   * 组件启动时调用
   * 绑定关闭按钮和升级按钮的点击事件
   */
  onStart(): void {
    this.close_img.on(Laya.Event.CLICK, this, () => {
      EventManager.getInstance().Emit("close_card_dialog", []);
    });
    this.upgrade_btn.on(Laya.Event.CLICK, this, this.upgradeCard);
  }

  /**
   * 升级卡牌
   * 
   * 升级流程：
   * 1. 检查玩家科学点数是否满足升级消耗
   * 2. 扣除科学点数
   * 3. 扣除升级所需的卡牌数量
   * 4. 提升卡牌等级
   * 5. 关闭弹窗并刷新卡牌列表
   * 
   * 注意：升级后剩余的卡牌数量 = 当前数量 - 升级目标数量
   */
  upgradeCard() {
    const cur_card = this.user_info;
    const cur_card_amount = cur_card.has_amount;
    const cur_level = cur_card.level;
    const cur_level_card_target = Data.Cards_Level_Target[cur_level];
    const cur_point_target = Data.Cards_Upgrade_Point[cur_level];
    // 判断是否有足够科学点
    if (userInfo.science_point >= cur_point_target) {
      userInfo.science_point -= cur_point_target;
      EventManager.getInstance().Emit("Science_SPEND_update", [cur_point_target]);
      const rest_card = cur_card_amount - cur_level_card_target;
      cur_card.has_amount = rest_card;
      cur_card.level++;
      EventManager.getInstance().Emit("close_card_dialog", []);
      EventManager.getInstance().Emit("CardList_update", []);
    } else {
      EventManager.getInstance().Emit("showToast", ["科学点不足"]);
    }
  }
}
