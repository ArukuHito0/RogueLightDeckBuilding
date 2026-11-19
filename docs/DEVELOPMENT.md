# 開発と引き継ぎ

## 基準版

- 公開版：v119、ACT1〜7。
- Sitesソースコミット：`f0aa2d0b4d48cacac196bc00eed526b7fa8b3579`。
- 本コピーは元リポジトリの現在の追跡ファイルだけを取得し、共有用文書・起動コマンド・CIを追加したもの。元のGit履歴やローカル作業ファイルは移していない。
- 本コピーの作成では、公開ゲームの機能・数値・セーブを変更していない。

## 実装の入口

| 対象 | 主なファイル |
|---|---|
| 基本状態・カード・セーブ | `dist/game.js` と後続の各上書きスクリプト |
| 戦闘解決・ダメージ・ターン | `dist/combat-update.js`、`dist/hunter-combat.js` |
| 基礎カード「取引」 | `dist/basic-trade.js` |
| キャラクター | `dist/characters.js`、`dist/hunter-cards.js`、`dist/lucky-cards.js` |
| ポーカー・スロット・フォールド | `dist/lucky.js` と `dist/lucky-*.js` |
| 図鑑・検索 | `dist/codex.js` |
| 遺物 | `dist/relics.js` ほか |
| ACT1 | `dist/enemies.js`、`dist/boss-audience.js` |
| ACT2〜7 | `dist/act2.js`〜`dist/act7.js` |
| ACT6妨害カード定義 | `dist/act6-cards.js` |
| 目的地とACT解放 | `dist/destinations.js` |
| クラウド保存 | `dist/cloud-save.js`、`worker/index.mjs` |
| バックアップ書出し・読込み | `dist/save-backup.js` |

これはES Modulesへの分割ではなく、グローバル関数・定数を順番に追加／ラップする構成。読込順を変更する際は、`tests/support/ai/ai-config.js` の `gameScripts` も一致させる。

## 維持する条件

- 保存キー `ashbound-v1`、保存形式 `v:1`、既存カードIDを維持する。
- `SAVES` と `/api/cloud-save` の互換性・アカウント分離を維持する。
- 認証ヘッダーをクライアント入力として信用する構成へ変更しない。公開ホスティングの認証境界が必要。
- 基礎カード・遺物の共有、探索者別デッキと潜在カードプールを維持する。
- 戦闘限定カード・追加効果を恒久所持カードへ混入させない。
- 機能変更時は `AGENTS.md` に従い、日本時間の日付でパッチノートを追記する。
- 遺物を別のアイテム名称に置き換えない。

## テストと検証範囲

`npm test` はACT3〜7、クラウドAPI、報酬再読込、ラッキー・ガールの解決順、取引、手札選択などの現行回帰を実行する。ACT1・2の履歴テストも保持しているが、個別の変更時は期待値が現行仕様と一致するか確認して選ぶ。

Nodeテストはブラウザ上の描画・操作感・端末ごとのレイアウトまで保証しない。公開前には対象画面・カード操作・表示倍率・スマートフォン幅でも確認する。

`docs/design/ACT1-6-enemy-spec-v118.md` はv118時点のソース仕様。ACT7は `dist/act7.js` と `tests/act7*.cjs` を参照。各設計書は初期案や旧名称を含むことがあるため、現行実装と区別する。

## 含めないもの

ユーザーのセーブ、セーブ復旧JSON、ブラウザプロファイル、Cookie、アクセストークン、認証情報、秘密の環境変数は登録しない。テスト中に生成されるメモリ上の架空セーブは、実プレイヤーの記録ではない。
