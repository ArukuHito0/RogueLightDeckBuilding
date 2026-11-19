// Append after all permanent card definitions, before restoring run instances.
const TRADE_CARD_ID=C.length;
C.push({id:TRADE_CARD_ID,name:'取引',cost:1,rarity:'rare',runOnly:false,types:['補助'],axis:'除外',icon:'⇄',desc:'カードを2枚除外する。カードを3枚引く。',fx:{chooseExhaust:2,exhaustDraw:3}});
