const { regClass, property } = Laya;
import EventManager from "./utils/EventManager";
import userInfo from "./model/userInfo";
import Data from "./model/index";

@regClass()
export class CardItem extends Laya.Script {
  @property({ type: Laya.ProgressBar })
  public level_progress: Laya.ProgressBar;
  @property({ type: Laya.Label })
  public progress_label: Laya.Label;
  @property({ type: Laya.Label })
  public level_label: Laya.Label;
  @property({ type: Laya.Image })
  public card_img: Laya.Image;
  @property({ type: Laya.Panel })
  public unlock_cover: Laya.Panel;
  @property({ type: Laya.Sprite })
  public upgrade_sprite: Laya.Sprite;
  @property({ type: Laya.Sprite })
  public card_panel: Laya.Sprite;

  private card_data: any;
  private card_idx: number;
  private user_card_info: any;
  private isShowDialog: boolean;
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
  // 判断等级和升级信息
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
  // 升级卡牌
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
