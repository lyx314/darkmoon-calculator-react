// 本文件由 scripts/gen-data.mjs 从原项目 Darkmoon-Calculator/scripts/data/materials.js 生成，请勿手工编辑。
import type { EnemyData, Material, Triplet } from "../domain/types";

type RawMaterial = {
  id: number;
  type: Material["type"];
  names: string[];
  keys: string[];
  enemies: { name: string; materialsPerEnemy: number[]; temp?: boolean }[];
};

const rawMaterials: RawMaterial[] = [
  {
    id: 1,
    type: "common",
    names: ["史莱姆凝液","史莱姆清","史莱姆原浆"],
    keys: ["SlimeCondensate","SlimeSecretions","SlimeConcentrate"],
    enemies: [
      { name: "史莱姆", materialsPerEnemy: [0.6723,0.1792,0.0448] },
      { name: "大型史莱姆", materialsPerEnemy: [1.6808,0.4482,0.112] },
    ],
  },
  {
    id: 2,
    type: "common",
    names: ["破损的面具","污秽的面具","不祥的面具"],
    keys: ["DamagedMask","StainedMask","OminousMask"],
    enemies: [
      { name: "丘丘人", materialsPerEnemy: [0.4202,0.112,0.028] },
      { name: "丘丘萨满", materialsPerEnemy: [0.1681,0.0448,0.0112] },
      { name: "丘丘射手", materialsPerEnemy: [0.1681,0.0448,0.0112] },
      { name: "驮兽·丘丘人", materialsPerEnemy: [2.5212,0.6723,0.168] },
      { name: "丘丘暴徒", materialsPerEnemy: [0.5253,0.1401,0.035] },
      { name: "丘丘王", materialsPerEnemy: [0.5253,0.1401,0.035] },
    ],
  },
  {
    id: 3,
    type: "common",
    names: ["导能绘卷","封魔绘卷","禁咒绘卷"],
    keys: ["DiviningScroll","SealedScroll","ForbiddenCurseScroll"],
    enemies: [
      { name: "丘丘萨满", materialsPerEnemy: [2.5212,0.6723,0.168] },
    ],
  },
  {
    id: 4,
    type: "common",
    names: ["牢固的箭簇","锐利的箭簇","历战的箭簇"],
    keys: ["FirmArrowhead","SharpArrowhead","WeatheredArrowhead"],
    enemies: [
      { name: "丘丘射手", materialsPerEnemy: [0.8404,0.2241,0.056] },
    ],
  },
  {
    id: 5,
    type: "elite",
    names: ["沉重号角","黑铜号角","黑晶号角"],
    keys: ["HeavyHorn","BlackBronzeHorn","BlackCrystalHorn"],
    enemies: [
      { name: "丘丘暴徒", materialsPerEnemy: [1.5758,0.4202,0.1051] },
      { name: "丘丘王", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 6,
    type: "elite",
    names: ["地脉的旧枝","地脉的枯叶","地脉的新芽"],
    keys: ["DeadLeyLineBranch","DeadLeyLineLeaves","LeyLineSprout"],
    enemies: [
      { name: "深渊法师", materialsPerEnemy: [2.6263,0.7003,0.1751] },
      { name: "深渊[使徒/咏者]", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 7,
    type: "elite",
    names: ["混沌装置","混沌回路","混沌炉心"],
    keys: ["ChaosDevice","ChaosCircuit","ChaosCore"],
    enemies: [
      { name: "遗迹[守卫/猎者]", materialsPerEnemy: [3.9394,1.0505,0.2626] },
      { name: "遗迹重机", materialsPerEnemy: [6.5658,1.7508,0.4378] },
    ],
  },
  {
    id: 8,
    type: "elite",
    names: ["雾虚花粉","雾虚草囊","雾虚灯芯"],
    keys: ["MistGrassPollen","MistGrass","MistGrassWick"],
    enemies: [
      { name: "萤术士", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 9,
    type: "elite",
    names: ["猎兵祭刀","特工祭刀","督察长祭刀"],
    keys: ["HuntersSacrificialKnife","AgentsSacrificialKnife","InspectorsSacrificialKnife"],
    enemies: [
      { name: "债务处理人", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 10,
    type: "common",
    names: ["新兵的徽记","士官的徽记","尉官的徽记"],
    keys: ["RecruitsInsignia","SergeantsInsignia","LieutenantsInsignia"],
    enemies: [
      { name: "愚人众先遣队", materialsPerEnemy: [4.202,1.1205,0.28] },
      { name: "驮兽·愚人众", materialsPerEnemy: [8.404,2.241,0.56] },
      { name: "萤术士", materialsPerEnemy: [0.5253,0.1401,0.035] },
      { name: "债务处理人", materialsPerEnemy: [0.5253,0.1401,0.035] },
    ],
  },
  {
    id: 11,
    type: "common",
    names: ["寻宝鸦印","藏银鸦印","攫金鸦印"],
    keys: ["TreasureHoarderInsignia","SilverRavenInsignia","GoldenRavenInsignia"],
    enemies: [
      { name: "驮兽·盗宝团", materialsPerEnemy: [5.0424,1.3446,0.336] },
      { name: "盗宝团", materialsPerEnemy: [1.2606,0.3362,0.084] },
    ],
  },
  {
    id: 12,
    type: "common",
    names: ["骗骗花蜜","微光花蜜","原素花蜜"],
    keys: ["WhopperflowerNectar","ShimmeringNectar","EnergyNectar"],
    enemies: [
      { name: "骗骗花", materialsPerEnemy: [4.202,1.1205,0.28] },
    ],
  },
  {
    id: 13,
    type: "elite",
    names: ["脆弱的骨片","结实的骨片","石化的骨片"],
    keys: ["FragileBoneShard","SturdyBoneShard","FossilizedBoneShard"],
    enemies: [
      { name: "龙蜥", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 14,
    type: "common",
    names: ["破旧的刀镡","影打刀镡","名刀镡"],
    keys: ["OldHandguard","KageuchiHandguard","FamedHandguard"],
    enemies: [
      { name: "野伏众", materialsPerEnemy: [1.6808,0.4482,0.112] },
      { name: "海乱鬼", materialsPerEnemy: [3.3616,0.8964,0.224] },
    ],
  },
  {
    id: 15,
    type: "elite",
    names: ["混沌机关","混沌枢纽","混沌真眼"],
    keys: ["ChaosGear","ChaosAxis","ChaosOculus"],
    enemies: [
      { name: "遗迹机兵", materialsPerEnemy: [2.6263,0.7003,0.1751] },
    ],
  },
  {
    id: 16,
    type: "elite",
    names: ["黯淡棱镜","水晶棱镜","偏光棱镜"],
    keys: ["DismalPrism","CrystalPrism","PolarizingPrism"],
    enemies: [
      { name: "藏镜仕女", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 17,
    type: "common",
    names: ["浮游干核","浮游幽核","浮游晶化核"],
    keys: ["SpectralHusk","SpectralHeart","SpectralNucleus"],
    enemies: [
      { name: "飘浮灵", materialsPerEnemy: [2.101,0.5602,0.14] },
    ],
  },
  {
    id: 18,
    type: "elite",
    names: ["隐兽指爪","隐兽利爪","隐兽鬼爪"],
    keys: ["ConcealedClaw","ConcealedUnguis","ConcealedTalon"],
    enemies: [
      { name: "兽境猎犬", materialsPerEnemy: [5.2526,1.4006,0.3502] },
      { name: "兽境幼兽", materialsPerEnemy: [2.6263,0.7003,0.1751] },
    ],
  },
  {
    id: 19,
    type: "elite",
    names: ["晦暗刻像","夤夜刻像","幽邃刻像"],
    keys: ["GloomyStatuette","DarkStatuette","DeathlyStatuette"],
    enemies: [
      { name: "黑蛇众", materialsPerEnemy: [6.5658,1.7508,0.4378] },
      { name: "深渊[使徒/咏者]", materialsPerEnemy: [0.5253,0.1401,0.035] },
    ],
  },
  {
    id: 20,
    type: "common",
    names: ["蕈兽孢子","荧光孢粉","孢囊晶尘"],
    keys: ["FungalSpores","LuminescentPollen","CrystallineCystDust"],
    enemies: [
      { name: "蕈兽", materialsPerEnemy: [0.8404,0.2241,0.056] },
      { name: "真蕈", materialsPerEnemy: [1.6808,0.4482,0.112] },
      { name: "[活化/枯焦]蕈兽", materialsPerEnemy: [0.2101,0.056,0.014] },
      { name: "[活化/枯焦]真蕈", materialsPerEnemy: [0.4202,0.1121,0.028] },
    ],
  },
  {
    id: 21,
    type: "elite",
    names: ["失活菌核","休眠菌核","茁壮菌核"],
    keys: ["InactivatedFungalNucleus","DormantFungalNucleus","RobustFungalNucleus"],
    enemies: [
      { name: "[活化/枯焦]蕈兽", materialsPerEnemy: [1.0505,0.2801,0.07] },
      { name: "[活化/枯焦]真蕈", materialsPerEnemy: [2.101,0.5602,0.1401] },
    ],
  },
  {
    id: 22,
    type: "common",
    names: ["褪色红绸","镶边红绸","织金红绸"],
    keys: ["FadedRedSatin","TrimmedRedSilk","RichRedBrocade"],
    enemies: [
      { name: "镀金旅团·小", materialsPerEnemy: [1.0505,0.2801,0.07] },
      { name: "镀金旅团·中", materialsPerEnemy: [2.101,0.5602,0.1401] },
      { name: "镀金旅团·大", materialsPerEnemy: [2.9414,0.7844,0.196] },
      { name: "驮兽·镀金旅团", materialsPerEnemy: [5.0424,1.3446,0.336] },
    ],
  },
  {
    id: 23,
    type: "elite",
    names: ["混沌容器","混沌模块","混沌锚栓"],
    keys: ["ChaosStorage","ChaosModule","ChaosBolt"],
    enemies: [
      { name: "遗迹龙兽", materialsPerEnemy: [3.9394,1.0505,0.2626] },
    ],
  },
  {
    id: 24,
    type: "elite",
    names: ["破缺棱晶","混浊棱晶","辉光棱晶"],
    keys: ["DamagedPrism","TurbidPrism","RadiantPrism"],
    enemies: [
      { name: "元能构装体", materialsPerEnemy: [2.6263,0.7003,0.1751] },
    ],
  },
  {
    id: 25,
    type: "elite",
    names: ["残毁的横脊","密固的横脊","锲纹的横脊"],
    keys: ["DesiccatedShell","SturdyShell","MarkedShell"],
    enemies: [
      { name: "圣骸兽", materialsPerEnemy: [6.5658,1.7508,0.4378] },
    ],
  },
  {
    id: 26,
    type: "elite",
    names: ["来自何处的待放之花","何人所珍藏之花","漫游者的盛放之花"],
    keys: ["AFlowerYetToBloom","TreasuredFlower","WanderersBloomingFlower"],
    enemies: [
      { name: "丘丘游侠", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 27,
    type: "common",
    names: ["异海凝珠","异海之块","异色结晶石"],
    keys: ["TransoceanicPearl","TransoceanicChunk","XenochromaticCrystal"],
    enemies: [
      { name: "原海异种·小", materialsPerEnemy: [0.8404,0.2241,0.056] },
      { name: "原海异种·大", materialsPerEnemy: [1.6808,0.4482,0.112] },
    ],
  },
  {
    id: 28,
    type: "common",
    names: ["啮合齿轮","机关正齿轮","奇械机芯齿轮"],
    keys: ["MeshingGear","MechanicalSpurGear","ArtificedDynamicGear"],
    enemies: [
      { name: "发条机关·大", materialsPerEnemy: [3.3616,0.8964,0.224] },
      { name: "发条机关·小", materialsPerEnemy: [1.2606,0.3362,0.084] },
    ],
  },
  {
    id: 29,
    type: "elite",
    names: ["浊水的一滴","浊水的一掬","初生的浊水幻灵"],
    keys: ["DropOfTaintedWater","ScoopOfTaintedWater","NewbornTaintedHydroPhantasm"],
    enemies: [
      { name: "浊水幻灵", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 30,
    type: "elite",
    names: ["隙间之核","外世突触","异界生命核"],
    keys: ["RiftCore","ForeignSynapse","AlienLifeCore"],
    enemies: [
      { name: "隙境原体·大", materialsPerEnemy: [6.5658,1.7508,0.4378] },
      { name: "隙境原体·小", materialsPerEnemy: [3.9394,1.0505,0.2626] },
    ],
  },
  {
    id: 31,
    type: "elite",
    names: ["老旧的役人怀表","役人的制式怀表","役人的时时刻刻"],
    keys: ["OldOperativesPocketWatch","OperativesStandardPocketWatch","OperativesConstancy"],
    enemies: [
      { name: "役人", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 32,
    type: "elite",
    names: ["羽状鳍翅","月色鳍翅","渊光鳍翅"],
    keys: ["FeatheryFin","LunarFin","ChasmlightFin"],
    enemies: [
      { name: "玄文兽", materialsPerEnemy: [3.9394,1.0505,0.2626] },
    ],
  },
  {
    id: 33,
    type: "elite",
    names: ["残毁的剑柄","裂断的剑柄","未熄的剑柄"],
    keys: ["RuinedHilt","SplinteredHilt","StillSmolderingHilt"],
    enemies: [
      { name: "魔像禁卫", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 34,
    type: "common",
    names: ["稚嫩的尖齿","老练的坚齿","横行霸者的利齿"],
    keys: ["JuvenileFang","SeasonedFang","TyrantsFang"],
    enemies: [
      { name: "纳塔龙众·大", materialsPerEnemy: [1.8489,0.493,0.1232] },
      { name: "纳塔龙众·小", materialsPerEnemy: [0.9244,0.2465,0.0616] },
    ],
  },
  {
    id: 35,
    type: "common",
    names: ["卫从的木哨","战士的铁哨","龙冠武士的金哨"],
    keys: ["SentrysWoodenWhistle","WarriorsMetalWhistle","SaurianCrownedWarriorsGoldenWhistle"],
    enemies: [
      { name: "部族龙形武士·大", materialsPerEnemy: [2.5212,0.6723,0.168] },
      { name: "部族龙形武士·小", materialsPerEnemy: [1.2606,0.3362,0.084] },
    ],
  },
  {
    id: 36,
    type: "elite",
    names: ["意志破碎的残片","意志明晰的寄偶","意志巡游的符像"],
    keys: ["ShardOfAShatteredWill","LocusOfAClearWill","SigilOfAStridingWill"],
    enemies: [
      { name: "大灵显化身", materialsPerEnemy: [6.5658,1.7508,0.4378] },
    ],
  },
  {
    id: 37,
    type: "elite",
    names: ["聚燃的石块","聚燃的命种","聚燃的游像眼"],
    keys: ["IgnitedStone","IgnitedSeedOfLife","IgnitedSeeingEye"],
    enemies: [
      { name: "熔岩游像", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
  {
    id: 38,
    type: "elite",
    names: ["秘源轴","秘源机鞘","秘源真芯"],
    keys: ["AxisOfTheSecretSource","SheathOfTheSecretSource","HeartOfTheSecretSource"],
    enemies: [
      { name: "秘源机兵·寻捕械", materialsPerEnemy: [4.596,1.2255,0.3064] },
    ],
  },
  {
    id: 39,
    type: "elite",
    names: ["折光的胚芽","惑光的阔叶","迷光的蜷叶之心"],
    keys: ["RefractiveBud","BewilderingBroadleaf","IllusoryLeafcoil"],
    enemies: [
      { name: "深邃拟覆叶·大", materialsPerEnemy: [7.8789,2.1009,0.5253] },
      { name: "深邃拟覆叶·中", materialsPerEnemy: [5.2526,1.4006,0.3502] },
      { name: "深邃拟覆叶·小", materialsPerEnemy: [3.9394,1.0505,0.2626] },
    ],
  },
  {
    id: 40,
    type: "elite",
    names: ["冷裂壳块","蕴热的背壳","明燃的棱状壳"],
    keys: ["ColdCrackedShellshard","WarmBackShell","BlazingPrismshell"],
    enemies: [
      { name: "炉壳山鼬", materialsPerEnemy: [6.5658,1.7508,0.4378] },
    ],
  },
  {
    id: 41,
    type: "common",
    names: ["毁损机轴","加固机轴","精制机轴"],
    keys: ["BrokenDriveShaft","ReinforcedDriveShaft","PrecisionDriveShaft"],
    enemies: [
      { name: "巡陆艇·大", materialsPerEnemy: [3.3616,0.8964,0.224] },
      { name: "巡陆艇·小", materialsPerEnemy: [1.6808,0.4482,0.112] },
    ],
  },
  {
    id: 42,
    type: "common",
    names: ["磨损的执凭","精致的执凭","霜镌的执凭"],
    keys: ["TatteredWarrant","ImmaculateWarrant","FrostEtchedWarrant"],
    enemies: [
      { name: "愚人众特辖队·大", materialsPerEnemy: [2.5212,0.6723,0.168] },
      { name: "愚人众特辖队·小", materialsPerEnemy: [1.2606,0.3362,0.084] },
    ],
  },
  {
    id: 43,
    type: "elite",
    names: ["霜夜的残照","霜夜的柔辉","霜夜的煌荣"],
    keys: ["FrostnightsGlimmer","FrostnightsGlow","FrostnightsGlory"],
    enemies: [
      { name: "霜夜灵嗣", materialsPerEnemy: [6.5658,1.7508,0.4378] },
    ],
  },
  {
    id: 44,
    type: "elite",
    names: ["失光块骨","稀光遗骼","繁光躯外骸"],
    keys: ["LightlessBone","GlowingRemains","RadiantExoskeleton"],
    enemies: [
      { name: "蕴光异兽", materialsPerEnemy: [6.5658,1.7508,0.4378] },
    ],
  },
  {
    id: 45,
    type: "elite",
    names: ["幽雾化形","幽雾片甲","幽雾兜盔"],
    keys: ["MistshroudManifestation","MistshroudPlate","MistshroudHelmet"],
    enemies: [
      { name: "荒野狂狩士", materialsPerEnemy: [5.2526,1.4006,0.3502] },
      { name: "荒野幽徒", materialsPerEnemy: [2.6263,0.7003,0.1751] },
    ],
  },
  {
    id: 46,
    type: "elite",
    names: ["深黯的裂眼","深黯的怪核","深黯的钩喙"],
    keys: ["FracturedEyeOfTheDeepShadow","AberrantCoreOfTheDeepShadow","HookedBeakOfTheDeepShadow"],
    enemies: [
      { name: "深黯钓客", materialsPerEnemy: [2.6263,0.7003,0.1751] },
    ],
  },
  {
    id: 47,
    type: "elite",
    names: ["失色的焰剑","残失的焰剑","宝饰的焰剑"],
    keys: ["FadedFlamingHilt","FracturedFlamingHilt","JeweledFlamingHilt"],
    enemies: [
      { name: "辖域守护者", materialsPerEnemy: [3.9394,1.0505,0.2626] },
    ],
  },
  {
    id: 48,
    type: "elite",
    names: ["残损的月铁","空竭的月铁","无秽的月铁"],
    keys: ["FracturedLunarIron","DepletedLunarIron","UnblemishedLunarIron"],
    enemies: [
      { name: "先驱秘源统辖阵列", materialsPerEnemy: [3.9394,1.0505,0.2626] },
    ],
  },
  {
    id: 49,
    type: "common",
    names: ["幻造萤屑","幻造裂晶","幻造晶鳞石"],
    keys: ["EtherealGlimmershard","EtherealCrystal","EtherealCrystalscaleStone"],
    enemies: [
      { name: "肌生晶石的妖精·大", materialsPerEnemy: [3.3616,0.8964,0.224] },
      { name: "肌生晶石的妖精·小", materialsPerEnemy: [1.2606,0.3362,0.084] },
      { name: "精英(随便写的)", materialsPerEnemy: [0.5253,0.1401,0.035] },
    ],
  },
  {
    id: 50,
    type: "common",
    names: ["嵌合种","并生嵌合胞","源生嵌合体"],
    keys: ["ChimericCore","SymbioticChimericNucleus","PrimeChimericNexus"],
    enemies: [
      { name: "异种合成魔兽·大", materialsPerEnemy: [3.3616,0.8964,0.224] },
      { name: "异种合成魔兽·小", materialsPerEnemy: [1.2606,0.3362,0.084] },
    ],
  },
  {
    id: 51,
    type: "elite",
    names: ["沉积残片","沉积结块","沉积增生物"],
    keys: ["AccretedFragment","AccretedMass","AccretedGrowth"],
    enemies: [
      { name: "兽怪暴徒·大", materialsPerEnemy: [3.9394,1.0505,0.2626] },
      { name: "兽怪暴徒·小", materialsPerEnemy: [2.101,0.5602,0.1401] },
    ],
  },
  {
    id: 52,
    type: "elite",
    names: ["灵生空根","灵生分蘖节","灵生盘枝心"],
    keys: ["HollowRootOfLife","SproutNodeOfLife","CoiledCoreOfLife"],
    enemies: [
      { name: "荒野树妖·大", materialsPerEnemy: [5.2526,1.4006,0.3502] },
      { name: "荒野树妖·小", materialsPerEnemy: [2.6263,0.7003,0.1751] },
    ],
  },
  {
    id: 53,
    type: "elite",
    names: ["雪结片心","雪结镜心","雪结无明心"],
    keys: ["SnowbornHeartshard","SnowbornMirrorheart","SnowbornHeartOfIgnorance"],
    enemies: [
      { name: "无智的凝冰体", materialsPerEnemy: [5.2526,1.4006,0.3502] },
    ],
  },
];

/** 53 种材料：19 普通 + 34 精英，id 1..53 */
export const materials: Material[] = rawMaterials.map((material) => ({
  id: material.id,
  type: material.type,
  names: material.names as Triplet<string>,
  keys: material.keys as Triplet<string>,
  enemies: material.enemies.map<EnemyData>((enemy) => ({
    name: enemy.name,
    materialsPerEnemy: enemy.materialsPerEnemy as Triplet<number>,
    temp: enemy.temp,
  })),
}));

/** 敌人等级区间选项，索引即为存储的 level 值 */
export const enemyLevelRanges: string[] = [
  "1 ~ 4",
  "5 ~ 9",
  "10 ~ 14",
  "15 ~ 19",
  "20 ~ 24",
  "25 ~ 29",
  "30 ~ 34",
  "35 ~ 39",
  "40 ~ 44",
  "45 ~ 49",
  "50 ~ 54",
  "55 ~ 59",
  "60 ~ 64",
  "65 ~ 69",
  "70 ~ 74",
  "75 ~ 79",
  "80 ~ 84",
  "85 ~ 89",
  "90 ~ 94",
  "95 ~ 99",
  "100 ~ 104"
];
