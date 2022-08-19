<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Ref, ComputedRef } from "vue";
import questList from "../../public/data/questData.json";
import npcZoneList from "../../public/data/npcZoneData.json";
import objectZoneList from "../../public/data/objectZoneData.json";

interface Xp {
  id: string;
  level: number;
  xp: number;
  requiredRaces: number;
  requiredRepFaction: number; 
}

interface Quest {
  name: string | null;
  startedBy: object | null;
  finishedBy: {
    creatureEnd: { npcZoneId: number } | null;
    objectEnd: { objectZoneId: number } | null;
  };
  requiredLevel: number;
  questLevel: number | null;
  requiredRaces: number;
  requiredClasses : number;
  objectivesText : object | null;
  triggerEnd: object | null;
  objectives: object | null;
  sourceItemId: number | null;
  preQuestGroup: object | null;
  preQuestSingle: object | null;
  childQuests: object | null;
  inGroupWith: object | null;
  exclusiveTo: object | null;
  zoneOrSort: number | null;
  requiredSkill: object | null;
  requiredMinRep: object | null;
  requiredMaxRep: object | null;
  requiredSourceItems: object | null;
  nextQuestInChain: number | null;
  questFlags: number | null;
  specialFlags: number | null;
  parentQuest: number | null;
  extraObjectives?: object | null;
}

const props = defineProps<{
  xp: Xp;
  quest: Quest;
  disableQuest: string[];
}>();
const emit = defineEmits<{
  (e: 'change', questId: string, questXp: number, checked: boolean, chainedQuestList: string[]): void;
}>();

const checkForCompetedMsg: Ref<string> = ref('Is completed');
const checked = ref(false);
let chainedQuestList: string[] = [];
const raceKeys: { [key: number]: string; } = {
  1101: 'alliance',
  690: 'horde',
  0: 'none',
  1: 'human',
  2: 'orc',
  4: 'dwarf',
  8: 'night elf',
  16: 'undead',
  32: 'tauren',
  64: 'gnome',
  128: 'troll',
  512: 'blood elf',
  1024: 'draenei'
}
const classKeys: { [key: number]: string; } = {
  0: 'none',
  1: 'warrior',
  2: 'paladin',
  4: 'hunter',
  8: 'rogue',
  16: 'priest',
  32: 'shaman',
  128: 'mage',
  256: 'warlock',
  1024: 'druid'
}
const skillKeys: { [key: number]: string; } = {
  171: 'alchemy',
  182: 'herbalism',
  185: 'cooking',
  186: 'mining',
  197: 'tailoring',
  356: 'fishing',
  393: 'skinning',
  762: 'riding'
}
const zoneIDs: { [key: number]: string; } =  {
  1: 'DUN MOROGH',
  3: 'BADLANDS',
  4: 'BLASTED LANDS',
  8: 'SWAMP OF SORROWS',
  10: 'DUSKWOOD',
  11: 'WETLANDS',
  12: 'ELWYNN FOREST',
  14: 'DUROTAR',
  15: 'DUSTWALLOW MARSH',
  16: 'AZSHARA',
  17: 'THE BARRENS',
  28: 'WESTERN PLAGUELANDS',
  33: 'STRANGLETHORN VALE',
  36: 'ALTERAC MOUNTAINS',
  38: 'LOCH MODAN',
  40: 'WESTFALL',
  41: 'DEADWIND PASS',
  44: 'REDRIDGE MOUNTAINS',
  45: 'ARATHI HIGHLANDS',
  46: 'BURNING STEPPES',
  47: 'THE HINTERLANDS',
  51: 'SEARING GORGE',
  85: 'TIRISFAL GLADES',
  130: 'SILVERPINE FOREST',
  139: 'EASTERN PLAGUELANDS',
  141: 'TELDRASSIL',
  148: 'DARKSHORE',
  209: 'SHADOWFANG KEEP',
  215: 'MULGORE',
  267: 'HILLSBRAD FOOTHILLS',
  331: 'ASHENVALE',
  357: 'FERALAS',
  361: 'FELWOOD',
  400: 'THOUSAND NEEDLES',
  405: 'DESOLACE',
  406: 'STONETALON MOUNTAINS',
  440: 'TANARIS',
  490: 'UN GORO CRATER',
  491: 'RAZORFEN KRAUL',
  493: 'MOONGLADE',
  618: 'WINTERSPRING',
  717: 'THE STOCKADE',
  718: 'WAILING CAVERNS',
  719: 'BLACKFATHOM DEEPS',
  721: 'GNOMEREGAN',
  722: 'RAZORFEN DOWNS',
  796: 'SCARLET MONASTERY',
  1176: 'ZUL FARRAK',
  1337: 'ULDAMAN',
  1377: 'SILITHUS',
  1477: 'THE TEMPLE OF ATAL HAKKAR',
  1497: 'UNDERCITY',
  1519: 'STORMWIND CITY',
  1537: 'IRONFORGE',
  1581: 'THE DEADMINES',
  1583: 'LOWER BLACKROCK SPIRE',
  1585: 'BLACKROCK DEPTHS',
  1637: 'ORGRIMMAR',
  1638: 'THUNDER BLUFF',
  1657: 'DARNASSUS',
  1977: 'ZUL GURUB',
  2017: 'STRATHOLME',
  2057: 'SCHOLOMANCE',
  2100: 'MARAUDON',
  2159: 'ONYXIAS LAIR',
  2257: 'DEEPRUN TRAM',
  2317: 'SOUTH SEAS',
  2366: 'THE BLACK MORASS',
  2367: 'OLD HILLSBRAD FOOTHILLS',
  2437: 'RAGEFIRE CHASM',
  2557: 'DIRE MAUL',
  2597: 'ALTERAC VALLEY',
  2677: 'BLACKWING LAIR',
  2717: 'MOLTEN CORE',
  2917: 'HALL OF LEGENDS',
  2918: 'CHAMPIONS HALL',
  3277: 'WARSONG GULCH',
  3358: 'ARATHI BASIN',
  3428: 'AHN QIRAJ',
  3429: 'RUINS OF AHN QIRAJ',
  3456: 'NAXXRAMAS',
  3430: 'EVERSONG WOODS',
  3433: 'GHOSTLANDS',
  3483: 'HELLFIRE PENINSULA',
  3487: 'SILVERMOON CITY',
  3518: 'NAGRAND',
  3519: 'TEROKKAR FOREST',
  3520: 'SHADOWMOON VALLEY',
  3521: 'ZANGARMARSH',
  3522: 'BLADES EDGE MOUNTAINS',
  3523: 'NETHERSTORM',
  3524: 'AZUREMYST ISLE',
  3525: 'BLOODMYST ISLE',
  3557: 'THE EXODAR',
  3562: 'HELLFIRE RAMPARTS',
  3606: 'HYJAL SUMMIT',
  3703: 'SHATTRATH CITY',
  3713: 'THE BLOOD FURNACE',
  3714: 'THE SHATTERED HALLS',
  3715: 'THE STEAMVAULT',
  3716: 'THE UNDERBOG',
  3717: 'THE SLAVE PENS',
  3847: 'THE BOTANICA',
  3848: 'THE ARCATRAZ',
  3849: 'THE MECHANAR',
  3789: 'SHADOW LABYRINTH',
  3790: 'AUCHENAI CRYPTS',
  3791: 'SETHEKK HALLS',
  3792: 'MANA TOMBS',
  3805: 'ZUL AMAN',
  3959: 'BLACK TEMPLE',
  4075: 'SUNWELL PLATEAU',
  4080: 'ISLE OF QUEL DANAS',
  4131: 'MAGISTERS TERRACE',
  7307: 'UPPER BLACKROCK SPIRE',
  3457: 'KARAZHAN'
};
const getQuestDifficultyClass: ComputedRef<string> = computed(() => {
  if (props.xp.xp >= 20000) {
    return 'quest-xp-orange';
  } else if (props.xp.xp >= 15000) {
    return 'quest-xp-yellow';
  } else if (props.xp.xp >= 10000) {
    return 'quest-xp-green';
  }
  return 'quest-xp-gray';
});
const getQuestRequiredRaces: ComputedRef<string> = computed(() => raceKeys[props.quest.requiredRaces] ? raceKeys[props.quest.requiredRaces] : '');
const getQuestRequiredClass: ComputedRef<string> = computed(() => raceKeys[props.quest.requiredClasses] === 'none' ? '': raceKeys[props.quest.requiredClasses]);
const getQuestRequiredSkill: ComputedRef<string> = computed(() => {
  if (props.quest.requiredSkill) {
    return skillKeys[props.quest.requiredSkill['1' as keyof object]] === 'none' ? '': skillKeys[props.quest.requiredSkill['1' as keyof object]];
  }
  return '';
});
const getQuestRequiredLevel: ComputedRef<number> = computed(() => props.quest.requiredLevel);
const getQuestZoneReturn: ComputedRef<string> = computed(() => {
  if (props.quest.finishedBy!.creatureEnd) {
    return getZoneQuestFinishedBy('creatureEnd', 'npcZoneId', npcZoneList);
  } else if(props.quest.finishedBy!.objectEnd) {
    return getZoneQuestFinishedBy('objectEnd', 'objectZoneId', objectZoneList);
  }
  return '';
});
const getQuestChain: ComputedRef<boolean> = computed(() => (props.quest.exclusiveTo || props.quest.preQuestSingle || props.quest.nextQuestInChain || props.quest.preQuestGroup) ? true : false);
const getDisableQuest: ComputedRef<boolean> = computed(() => props.disableQuest.includes(props.xp.id));

watch(props, (newProps) => {
  if (newProps.disableQuest.includes(props.xp.id)) {
    checked.value = false;
  }
});

const getPreQuestSingle = (quest: string) => {
  if (questList[quest as keyof object]['preQuestSingle']) {
    const preQuestSingle = questList[quest as keyof object]['preQuestSingle']['1'];
    chainedQuestList = [...chainedQuestList, String(preQuestSingle)];
    getPreQuestSingle(preQuestSingle);
  }
}

const getNextQuestInChain = (quest: string) => {
  if (questList[quest as keyof object]['nextQuestInChain']) {
    const nextQuestInChain = questList[quest as keyof object]['nextQuestInChain'];
    chainedQuestList = [...chainedQuestList, String(nextQuestInChain)];
    getNextQuestInChain(nextQuestInChain);
  }
}

const getPreQuestGroup = (quest: string) => {
  if (questList[quest as keyof object]['preQuestGroup']) {
    const preQuestGroup = Object.values(questList[quest as keyof object]['preQuestGroup']).map((key) => String(key));
    chainedQuestList = chainedQuestList.concat(preQuestGroup);
    for(const quest of preQuestGroup) {
      getPreQuestGroup(quest);
    }
  }
}

const getExclusiveTo = (quest: string) => {
  if (questList[quest as keyof object]['exclusiveTo']) {
    const exclusiveTo = Object.values(questList[quest as keyof object]['exclusiveTo']).map((key) => String(key));
    chainedQuestList = chainedQuestList.concat(exclusiveTo);
  }
}

const getZoneQuestFinishedBy = (finishedBy: string, finishedByZoneId: string, zoneList: object): string => {
  const finishedById = props.quest.finishedBy[finishedBy as keyof object][finishedByZoneId];
  const finishedByZoneIdObj = zoneList[finishedById as keyof object];
  const finishedZoneId = finishedByZoneIdObj[finishedByZoneId];
  return zoneIDs[finishedZoneId];
}

const checkQuest = (questId: string, questXp: number, checked: boolean): void => {
  if (checked && !chainedQuestList.length) {
    getPreQuestSingle(questId);
    getNextQuestInChain(questId);
    getPreQuestGroup(questId);
    getExclusiveTo(questId);
  }
  emit('change', questId, questXp, checked, chainedQuestList);
}

const checkForCompleted = async (event: Event, questId: string): Promise<void> => {
  if (!questId) return;
  const checkForCompetedString = `/run print(C_QuestLog.IsQuestFlaggedCompleted(${questId}))`;
  await navigator.clipboard.writeText(checkForCompetedString).then(() => {
    // checkForCompetedMsg.value = 'Copied!'
  }
  , () => checkForCompetedMsg.value = 'Not copied!');
}

</script>
<template>
  <li :class="{'quest-row-disable': getDisableQuest}" class="quest-row">
    <div class="quest-first-row">
      <input 
        v-model="checked" 
        @change="checkQuest(xp.id, xp.xp, checked)" 
        type="checkbox">
      <span :class="getQuestDifficultyClass" class="quest-xp">{{ xp.xp }}</span>
      <a 
        :href="`https://www.wowhead.com/wotlk/quest=${xp.id}`"
        :data-wowhead="`quest=${xp.id}`"
        target="_blank"
        class="quest-name">{{ quest.name }}</a>
      <button @click="checkForCompleted($event, xp.id)" class="quest-is-completed">Check if completed</button>
    </div>
    <div class="quest-second-row">
      <div>
        <span v-if="getQuestRequiredLevel > 0">{{ getQuestRequiredLevel }}</span>
        <span v-if="getQuestRequiredRaces" class="quest-race-image"><img :src="`../../public/images/${getQuestRequiredRaces}-banner.webp`"></span>
        <span v-if="getQuestRequiredClass">{{ getQuestRequiredClass }}</span>
        <span v-if="getQuestRequiredSkill" class="quest-skill-image"><img :src="`../../public/images/${getQuestRequiredSkill}.webp`"></span>
        <span v-if="getQuestChain" class="quest-chain-image"></span>
      </div>
      <span class="quest-zone-return">{{ getQuestZoneReturn }}</span>
    </div>
  </li>
</template>

<style scoped>
i {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;

  color: var(--color-text);
}

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: var(--color-heading);
}
.quest-row {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background-color: var(--umber);
  border-radius: 2px;
}
.quest-row-disable {
  background-color: whitesmoke;
}
.quest-row input[type='checkbox'] {
  margin-right: 10px;
}
.quest-xp {
  font-size: 18px;
  margin-right: 10px;
}
.quest-xp.quest-xp-orange {
  color: rgb(255 128 64 / 80%); 
}
.quest-xp.quest-xp-yellow {
  color: rgb(255 255 0 / 80%); 
}
.quest-xp.quest-xp-green {
  color: rgb(64 191 64 / 80%); 
}
.quest-xp.quest-xp-gray {
  color: rgb(128 128 128 / 80%);
}
.quest-name {
  font-size: 16px;
}
.quest-is-completed {
  float: right;
}
.quest-second-row {
  display: flex;
  justify-content: space-between;
}
.quest-second-row > div {
  display: flex;
}
.quest-second-row span {
  margin-right: 10px;
}
.quest-race-image img,.quest-skill-image img {
  display: block;
  height: 25px;
}
.quest-chain-image {
  width: 25px;
  height: 25px;
  background: url("./../public/images/chain-quest.webp") no-repeat;
}
.quest-second-row .quest-zone-return {
  margin-right: 0;
}

</style>
