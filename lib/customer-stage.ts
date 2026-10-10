export type CustomerStage = "upstream" | "midstream" | "downstream";
export const DEFAULT_CUSTOMER_STAGE: CustomerStage = "midstream";
export const stageExperiences = {
  upstream: { label: "未登録・契約前（川上）", status: "家づくりをご検討中", mainLabel: "見学・イベント", mainPage: "events", noticeTitle: "家づくり相談会を開催しています", noticeSummary: "土地探しや資金計画から、お気軽にご相談ください" },
  midstream: { label: "契約後〜引き渡し前（川中）", status: "山田様邸｜設計・仕様打合せ中", mainLabel: "わが家", mainPage: "myhome", noticeTitle: "図面の確認をお願いします", noticeSummary: "1階平面図 Ver.3 ／ キッチン横の収納を変更しました" },
  downstream: { label: "引き渡し後（川下）", status: "山田様邸｜お引き渡し済み", mainLabel: "わが家", mainPage: "myhome", noticeTitle: "定期点検のご案内", noticeSummary: "お引き渡し後1年点検のご希望日をお知らせください" },
} as const;
export function getStageExperience(stage: CustomerStage) { return stageExperiences[stage]; }
