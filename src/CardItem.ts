/**
 * 卡牌列表项组件
 * 负责单个卡牌在卡牌列表页面中的展示
 * 显示卡牌的收集进度、等级状态和升级提示
 * 
 * 核心功能：
 * - 初始化卡牌显示状态（锁定/已解锁）
 * - 更新卡牌收集进度和等级信息
 * - 点击卡牌弹出详情弹窗
 */

const { regClass, property } = Laya;
import EventManager from "./utils/EventManager";
import userInfo from "./model/userInfo";
import Data from "./model/index";

@regClass()
export class CardItem extends Laya.Script {
  /** 等级进度条 */
  @property({ type: Laya.ProgressBar })
  public level_progress: Laya.ProgressBar;
  /** 进度文本标签 */
  @property({ type: Laya.Label })
  public progress_label: Laya.Label;
  /** 等级标签 */
  @property({ type: Laya.Label })
  public level_label: Laya.Label;
  /** 卡牌图片 */
  @property({ type: Laya.Image })
  public card_img: Laya.Image;
  /** 锁定遮罩面板 */
  @property({ type: Laya.Panel })
  public unlock_cover: Laya.Panel;
  /** 升级提示精灵 */
  @property({ type: Laya.Sprite })
  public upgrade_sprite: Laya.Sprite;
  /** 卡牌点击面板 */
  @property({ type: Laya.Sprite })
  public card_panel: Laya.Sprite;

  /** 卡牌静态配置数据 */
  private card_data: any;
  /** 玩家在 userInfo.Card 中的索引 */
  private card_idx: number;
  /** 玩家拥有的该卡牌信息 */
  private user_card_info: any;
  /** 是否可以显示详情弹窗 */
  private isShowDialog: boolean;

  /**
   * 初始化卡牌显示
   * @param data - 卡牌静态配置数据
   * 
   * 状态判断：
   * - 如果玩家已拥有该卡牌且等级 > 0：显示为已解锁状态，可点击
   * - 如果玩家已拥有但等级为 0：显示为锁定状态
   * - 如果玩家未拥有：显示为 locked 状态
   */
  public initCard(data: any): void {
    this.card_data = data;
    this.card_idx = userInfo.Card.findIndex(
      (cardInfo) => cardInfo.name === data.name
    );
    if (this.card_idx != -1) {
      if (userInfo.Card[this.card_idx].level > 0) {
        this.unlock_cover.visible = false;
        this.user_card_info = userInfo.Card[this.card_idx];
        this.isShowDialog = true;
      } else {
        this.unlock_cover.visible = true;
        this.isShowDialog = false;
      }
      this.level_label.text = "等级" + userInfo.Card[this.card_idx].level;
      this.checkCardInfo();
    } else {
      this.level_label.text = "locked";
      this.level_progress.value = 0;
      this.unlock_cover.visible = true;
      this.isShowDialog = false;
    }
  }

  /**
   * 更新卡牌信息
   * 当卡牌数据发生变化时（如抽卡后）调用此方法刷新显示
   * 如果卡牌从"未拥有"变为"已拥有"，需要重新初始化显示状态
   */
  public updateCardInfo() {
    if (this.card_idx != -1) {
      this.checkCardInfo();
      this.level_label.text = "等级" + userInfo.Card[this.card_idx].level;
    } else {
      this.card_idx = userInfo.Card.findIndex(
        (cardInfo) => cardInfo.name === this.card_data.name
      );
      if (this.card_idx != -1) {
        this.unlock_cover.visible = false;
        this.isShowDialog = true;
        this.checkCardInfo();
      }
    }
  }

  /**
   * 检查卡牌的等级和升级信息
   * 根据当前收集数量和升级目标数量更新进度条和升级提示
   * 
   * 逻辑：
   * - 当前数量 < 目标数量：显示收集进度条
   * - 当前数量 >= 目标数量：显示升级提示（upgrade_sprite）
   */
  checkCardInfo() {
    const cur_card = userInfo.Card[this.card_idx];
    this.user_card_info = userInfo.Card[this.card_idx];
    const cur_target = Data.Cards_Level_Target[cur_card.level];
    if (cur_target > cur_card.has_amount) {
      this.level_progress.value = cur_card.has_amount / cur_target;
      this.upgrade_sprite.visible = false;
    } else {
      // 等待升级
      this.level_progress.value = 1;
      // 升级提示
      this.upgrade_sprite.visible = true;
    }
    this.progress_label.text = cur_card.has_amount + "/" + cur_target;
  }

  /**
   * 升级卡牌
   * 在列表页面直接升级卡牌（与 CardDialog 中的升级逻辑类似）
   * 
   * 升级流程：
   * 1. 检查科学点数是否足够
   * 2. 扣除科学点数
   * 3. 扣除升级所需的卡牌数量
   * 4. 提升等级并更新显示
   * 5. 判断升级后是否仍满足下一级条件，显示/隐藏升级提示
   */
  upgradeCard() {
    console.log("upgrade");
    const cur_card = userInfo.Card[this.card_idx];
    const cur_card_amount = userInfo.Card[this.card_idx].has_amount;
    const cur_level = cur_card.level;
    const cur_level_card_target = Data.Cards_Level_Target[cur_level];
    const next_level = cur_level + 1;
    const next_level_card_target = Data.Cards_Level_Target[next_level];
    const cur_point_target = Data.Cards_Upgrade_Point[cur_level];
    // 判断是否有足够科学点
    if (userInfo.science_point >= cur_point_target) {
      userInfo.science_point -= cur_point_target;
      EventManager.getInstance().Emit('Science_SPEND_update',[cur_point_target])
      const rest_card = cur_card_amount - cur_level_card_target;
      if (rest_card >= next_level_card_target) {
        this.upgrade_sprite.visible = true;
      } else {
        this.upgrade_sprite.visible = false;
      }
      this.level_progress.value = rest_card / next_level_card_target;
      this.progress_label.text = rest_card + "/" + next_level_card_target;
      cur_card.has_amount = rest_card;
      cur_card.level++;
      if (cur_card.level > 0) {
        this.level_label.text = "等级" + cur_card.level;
      }
    }
  }

  /**
   * 组件启动时调用
   * 绑定卡牌点击事件，点击时发送 showCardDialog 事件
   */
  onStart() {
    this.card_panel.on(Laya.Event.CLICK, this, () => {
      console.log("showCardDialog");
      const data = {
        card_info: this.card_data,
        user_info: this.user_card_info,
        isShowDialog: this.isShowDialog,
      };
      EventManager.getInstance().Emit("showCardDialog", [data]);
    });
    // this.upgrade_sprite.on(Laya.Event.CLICK, this, this.upgradeCard);
  }
}
