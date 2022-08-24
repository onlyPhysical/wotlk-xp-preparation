<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Ref, ComputedRef } from "vue";
import questList from "../../public/data/questData.json";
import npcZoneList from "../../public/data/npcZoneData.json";
import objectZoneList from "../../public/data/objectZoneData.json";
import { raceKeys, skillKeys, zoneIDs } from "../../public/utils/const";

interface Xp {
  id: string;
  level: number;
  xp: number;
  requiredRaces: number;
  requiredRepFaction: number; 
}

interface Quest {
  name: string;
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
  factionFilter: { faction: Ref<number>, repFaction: Ref<number> };
  markChainQuestList: string[];
  disableQuestItemList: string[];
  isQuetsLogFull: boolean;
}>();
const emit = defineEmits<{
  (e: 'check', questId: string, questXp: number, questName: string, zone: string, checked: boolean, chainedQuestList: string[]): void;
}>();

const checkForCompetedMsg: Ref<string> = ref('Is completed');
const checked = ref(false);
const isQuetsLogFull = ref(false);
let chainedQuestList: string[] = [];

watch([props.factionFilter.faction, props.factionFilter.repFaction], (newProps) => {
  if (newProps) {
    checked.value = false;
  }
});

watch(props.markChainQuestList, (newProps) => {
  console.warn('Reeeee');
  if (newProps.includes(props.xp.id)) {
    checked.value = false;
  }
});

watch(props, (newProps) => {
  if (newProps) {
    isQuetsLogFull.value = checked.value === false ? props.isQuetsLogFull : false;
  }
});

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
const getQuestReturnZone: ComputedRef<string> = computed(() => {
  if (props.quest.finishedBy!.creatureEnd) {
    return getZoneQuestFinishedBy('creatureEnd', 'npcZoneId', npcZoneList);
  } else if(props.quest.finishedBy!.objectEnd) {
    return getZoneQuestFinishedBy('objectEnd', 'objectZoneId', objectZoneList);
  }
  return '';
});
const getQuestChain: ComputedRef<boolean> = computed(() => (props.quest.exclusiveTo || props.quest.preQuestSingle || props.quest.nextQuestInChain || props.quest.preQuestGroup) ? true : false);
const getMarkQuest: ComputedRef<boolean> = computed(() => props.markChainQuestList.includes(props.xp.id));
const getDisableQuestItem: ComputedRef<boolean> = computed(() => props.disableQuestItemList.includes(props.xp.id));

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

const checkQuest = (questId: string, questXp: number, questName: string, zone: string, checked: boolean): void => {
  if (checked && !chainedQuestList.length) {
    getPreQuestSingle(questId);
    getNextQuestInChain(questId);
    getPreQuestGroup(questId);
    getExclusiveTo(questId);
  }
  emit('check', questId, questXp, questName, zone, checked, chainedQuestList);
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
  <li :class="{'quest-row-mark': getMarkQuest}" class="quest-row">
    <div class="quest-first-row">
      <input 
        v-model="checked" 
        @change="checkQuest(xp.id, xp.xp, quest.name, getQuestReturnZone, checked)"
        :disabled="getDisableQuestItem || isQuetsLogFull"
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
      <span class="quest-zone-return">{{ getQuestReturnZone }}</span>
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
.quest-row-mark {
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
