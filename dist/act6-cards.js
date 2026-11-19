// Permanent IDs are appended before saved battle instances are hydrated.
const SWAMP_JUNK_IDS={};
for(const [key,name,cost,desc,icon,fx] of [
 ['mud','泥塊',0,'効果なし。除外。','▰',{ex:1}],
 ['root','絡み根',1,'カードを1枚引く。除外。','⌁',{draw:1,ex:1}],
 ['thorn','毒棘',0,'自身に毒3を付与。除外。','♠',{selfPoison:3,ex:1}],
 ['miasma','瘴気',0,'使用不可。ターン終了時、3ダメージを受け、除外する。','≋',{unplayable:1}],
 ['spore','毒胞子',0,'自身に脱力1を付与。除外。','∴',{selfWeak:1,ex:1}],
 ['mist','霧影',0,'使用不可。ターン終了時に除外する。','☁',{unplayable:1}]
]){const id=C.length;SWAMP_JUNK_IDS[key]=id;C.push({id,name,cost,desc,icon,rarity:'token',runOnly:true,token:true,act6Junk:key,types:['妨害'],fx});}
