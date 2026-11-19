// All balance thresholds and behavior weights are explicit and recorded with reports.
globalThis.AI_TUNING={
 frontload:{damagePerEnergy:8,blockPerEnergy:7,zeroCostDenominator:1,areaTargets:2},
 deck:{minBlock:4,minReusableBlock:3,maxSelfHarm:2,maxHeavyShare:.25,targetHealing:1,targetDamage:3,targetFrontBlock:2,targetScaling:4,targetDraw:3,midFloor:4,lateFloor:7,shortagePenalty:9,surplusValue:.18},
 tolerance:{base:3,min:1,max:5,maxHpRatio:.07,highHpAt:.75,highHpBonus:2,lowHpAt:.3,lowHpPenalty:3,lethalBonus:3,selfHarmShare:.2,selfHarmBonus:1,cumulativeRatio:.2,cumulativePenalty:3,farRest:4,restPenalty:2,absoluteMax:10},
 heal:{baseWeight:1.1,selfHarmBonus:1.1,blockBonus:.6,healthyAt:.8,healthyMultiplier:.2},
 poison:{catalystSetup:10,transitionBonus:12,beforeCleansePenalty:20,reserveExcluded:12,shortPoisonPenalty:5,rebuildBonus:12,comboWeight:2,comboLethal:30,waitForPoison:10},
 combat:{longTurns:4,assumedDamagePerTurn:14,poisonHorizon:3,scalingWeight:3,lethalBonus:40,defenseWeight:2.4,maxSameCardPlays:6}
};
