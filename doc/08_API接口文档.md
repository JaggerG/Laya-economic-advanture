# API 接口文档

## 8.1 EventManager 事件管理器

全局单例事件管理器，基于 Laya.EventDispatcher 实现。

### 文件位置

[utils/EventManager.ts](file:///c:/Users/890060/Desktop/Laya-economic-advanture/src/utils/EventManager.ts)

### 获取实例

```typescript
EventManager.getInstance()
```

### 方法

#### Emit(eventName: string, args?: any[])

派发事件。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| eventName | string | 是 | 事件名称 |
| args | any[] | 否 | 事件参数数组 |

```typescript
EventManager.getInstance().Emit('Science_update', []);
EventManager.getInstance().Emit('Potato_COLLECT_update', [produce_num]);
```

#### Add(eventName: string, caller: any, listener: Function, args?: any[])

订阅事件。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| eventName | string | 是 | 事件名称 |
| caller | any | 是 | 回调函数的 this 指向 |
| listener | Function | 是 | 回调函数 |
| args | any[] | 否 | 附加参数 |

```typescript
EventManager.getInstance().Add('Science_update', this, () => {
  this.s_point_label.text = userInfo.science_point.toString();
});
```

#### Off(eventName: string, caller: any, listener: Function)

取消订阅事件。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| eventName | string | 是 | 事件名称 |
| caller | any | 是 | 回调函数的 this 指向 |
| listener | Function | 是 | 回调函数 |

```typescript
EventManager.getInstance().Off('Science_update', this, this.updateHandler);
```

### 事件列表

| 事件名 | 触发时机 | 参数 |
|--------|---------|------|
| `Science_update` | 科学点数变化 | - |
| `Science_SPEND_update` | 花费科学点数 | [花费数量] |
| `task_progress_update` | 任务整体进度更新 | - |
| `updateParentLabel` | 父资源数量变化 | [panel_idx] |
| `updateEmployeeLabel` | 雇员数量变化 | - |
| `updatePurchaseTimes` | 购买批量切换 | [批量类型] |
| `showCardDialog` | 显示卡牌详情 | [cardData] |
| `close_card_dialog` | 关闭卡牌详情 | - |
| `CardList_update` | 卡牌列表更新 | - |
| `Card_COLLECT_update` | 卡牌收集进度更新 | [收集数量] |
| `{name}_update` | 资产数据更新 | - |
| `{name}_COLLECT_update` | 资产收集进度更新 | [收集数量] |
| `updateChildLabel{name}` | 子资产标签更新 | - |

---

## 8.2 Assets 资产工具

资产相关的计算工具函数集合。

### 文件位置

[utils/Assets.ts](file:///c:/Users/890060/Desktop/Laya-economic-advanture/src/utils/Assets.ts)

### 方法

#### produce_sec_sum(parent_idx: number, child_idx: number): string

计算资产每秒产出数量。

| 参数 | 类型 | 说明 |
|------|------|------|
| parent_idx | number | 父资源索引 |
| child_idx | number | 子资产索引 |

**返回值**：格式化后的每秒产出字符串（含单位）

**计算逻辑**：
```
产出 = amount × outcome × Power / (time / Speed)
```

#### can_buy_sum(parent_idx: number, child_idx: number): Decimal

计算当前可购买的最大资产数量。

| 参数 | 类型 | 说明 |
|------|------|------|
| parent_idx | number | 父资源索引 |
| child_idx | number | 子资产索引 |

**返回值**：可购买数量（Decimal 类型）

**计算逻辑**：
1. 遍历资产的 cost 配置
2. 根据消耗类型获取当前资源数量
3. 应用 Discount 加成：`target / Discount`
4. 计算可购买数量：`target / quantity`
5. 返回所有消耗项中的最小值

#### convertToUnits(number: string): string

将大数值转换为带单位的字符串。

| 参数 | 类型 | 说明 |
|------|------|------|
| number | string | 原始数值字符串 |

**返回值**：带单位的格式化字符串

**单位表**：

| 单位 | 数值范围 |
|------|---------|
| (无) | < 1,000 |
| K | 1,000 ~ 999,999 |
| M | 10^6 ~ 10^9-1 |
| B | 10^9 ~ 10^12-1 |
| T | 10^12 ~ 10^15-1 |
| Q | 10^15 ~ 10^18-1 |
| AA ~ ZZ | 10^18 以上 |

```typescript
Assets.convertToUnits('1500');      // "1.50K"
Assets.convertToUnits('2500000');   // "2.50M"
Assets.convertToUnits('100');       // "100"
```

---

## 8.3 Lottery 抽奖系统

卡牌抽取和科学点数随机工具。

### 文件位置

[utils/lottery.ts](file:///c:/Users/890060/Desktop/Laya-economic-advanture/src/utils/lottery.ts)

### 方法

#### drawCard(total: number, atLeast: number): any[]

抽取卡牌。

| 参数 | 类型 | 说明 |
|------|------|------|
| total | number | 总抽取数量 |
| atLeast | number | 保底数量 |

**返回值**：卡牌信息数组

**抽取逻辑**：
1. 随机抽取 `total` 张卡牌
2. 额外抽取 `atLeast` 张保底卡牌
3. 使用权重随机算法（weight 属性）

#### drawSciencePoint(min: number, max: number): number

随机生成科学点数。

| 参数 | 类型 | 说明 |
|------|------|------|
| min | number | 最小值 |
| max | number | 最大值 |

**返回值**：范围内的随机整数

#### collectCard(cardInfo: any[]): any[]

收集卡牌并更新玩家数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| cardInfo | any[] | 抽取的卡牌数组 |

**返回值**：去重后的卡牌数据（用于动画展示）

**处理逻辑**：
1. 统计每张卡牌的出现次数
2. 更新 `userInfo.Card` 中的 `has_amount`
3. 如果是新卡牌，初始化 `level: 0`

#### getRandomInt(min: number, max: number): number

生成范围内的随机整数。

| 参数 | 类型 | 说明 |
|------|------|------|
| min | number | 最小值（含） |
| max | number | 最大值（含） |

---

## 8.4 数据模型接口

### 8.4.1 资产配置（Assets）

```typescript
interface AssetConfig {
  name: string;           // 资源名称（Potato/Orange/Tomato）
  amount: number;         // 当前数量
  img_url: string;        // 图片路径
  child: ChildAsset[];    // 子资产列表
}

interface ChildAsset {
  name: string;           // 资产名称
  amount: number;         // 拥有数量
  level: number;          // 等级
  outcome: number;        // 单次产出
  produce: string;        // 产出目标
  time: number;           // 生产周期（秒）
  desc: string;           // 描述
  cost: CostItem[];       // 购买消耗
  bonus: BonusConfig;     // 五维加成
}

interface CostItem {
  name: string;           // 消耗品名称
  quantity: number;       // 消耗数量
}

interface BonusConfig {
  Power: { name: string; quantity: number; url_img: string; };
  Discount: { name: string; quantity: number; url_img: string; };
  Speed: { name: string; quantity: number; url_img: string; };
  Chance: { name: string; quantity: number; url_img: string; };
  Bonus: { name: string; quantity: number; url_img: string; };
}
```

### 8.4.2 卡牌配置（Cards）

```typescript
interface CardConfig {
  name: string;           // 卡牌名称
  imgUrl: string;         // 图片路径
  type: string;           // 加成类型
  related_assets: string; // 关联资产
  level_ratio: number;    // 每级倍率
  level_require: number;  // 等级要求
  level: number;          // 当前等级
  origin_ratio: number;   // 初始倍率
  cost: number;           // 升级消耗
  has_amount: number;     // 已收集数量
  weight: number;         // 抽卡权重
}
```

### 8.4.3 任务配置（Tasks）

```typescript
interface TaskConfig {
  level: number;          // 任务等级
  config: TaskItem[];     // 任务列表
}

interface TaskItem {
  desc: string;           // 任务描述
  type: 'OWN' | 'SPEND' | 'COLLECT';  // 任务类型
  target_asset: string;   // 目标资产
  target: number;         // 目标数量
  reward: RewardConfig;   // 奖励配置
}

interface RewardConfig {
  c_min: number;          // 最小卡牌数
  c_max: number;          // 最大卡牌数
  atLeast: number;        // 保底数量
  s_min: number;          // 最小科学点
  s_max: number;          // 最大科学点
}
```

### 8.4.4 玩家数据（userInfo）

```typescript
interface UserInfo {
  level: number;          // 玩家等级
  science_point: number;  // 科学点数
  Task: {
    task_level: number;   // 任务等级
    task_progress: number;// 任务进度
    task_idx_max: number; // 最大任务索引
    task_idx_config: { idx: number; step: number; }[];  // 任务配置
    task_step: number;    // 已完成任务数
  };
  Card: CardConfig[];     // 玩家卡牌列表
}
```

---

## 8.5 组件公共接口

### 8.5.1 AssetItem

```typescript
class AssetItem extends Laya.Script {
  public data: any;                    // 初始化数据
  public changeProgress(): void;       // 进度更新（定时器回调）
  public produce_goods(): void;        // 生产物品
  public handleBuyBtn(): void;         // 购买按钮回调
  public updateChildLabel(): void;     // 更新子资产标签
  public updatePurchaseTimes(type?: any): void;  // 更新购买批量
  public initData(): void;             // 初始化数据
}
```

### 8.5.2 CardItem

```typescript
class CardItem extends Laya.Script {
  public initCard(data: any): void;    // 初始化卡牌
  public updateCardInfo(): void;       // 更新卡牌信息
  public checkCardInfo(): void;        // 检查卡牌等级状态
  public upgradeCard(): void;          // 升级卡牌
}
```

### 8.5.3 TaskItem

```typescript
class TaskItem extends Laya.Script {
  public initData(data: any): void;    // 初始化任务
  public handleFinishClick(): void;    // 完成按钮回调
  public updateProgress(data?: any): void;  // 更新进度
  public initNextTask(): void;         // 初始化下一个任务
}
```
