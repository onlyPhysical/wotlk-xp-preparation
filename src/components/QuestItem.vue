<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { Ref, ComputedRef } from "vue";
import questList from "../../public/data/questData.json";
import npcZoneList from "../../public/data/npcZoneData.json";
import objectZoneList from "../../public/data/objectZoneData.json";
import { raceKeys, skillKeys, zoneIDs, itemKeys } from "../../public/utils/const";

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
  disableQuestList: string[];
  selectedQuestList: Array<{ questId: string, questXp: number, questName: string, zone: string }>;
}>();
const emit = defineEmits<{
  (e: 'check', questId: string, questXp: number, questName: string, zone: string, checked: boolean, chainedQuestList: string[]): void;
}>();

const checkForCompetedMsg: Ref<string> = ref('Check if you have completed this quest');
const checked = ref(false);
const questChainTooltipMsg = 'This quest is part of a quest series, you can have only one quest in your Quest Log from a particular chain!';
let chainedQuestList: string[] = [];

onMounted(() => {
  if (props.selectedQuestList.length) {
    if (props.selectedQuestList.map((key) => key.questId).includes(props.xp.id)) {
      checked.value = true;
    }
  }
})

watch([props.factionFilter.faction, props.factionFilter.repFaction], (newProps) => {
  if (newProps) {
    checked.value = false;
  }
});

watch(props, (newProps) => {
  if (newProps.markChainQuestList.includes(props.xp.id)) {
    checked.value = false;
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
const getMarkQuest: ComputedRef<boolean> = computed(() => {
  if(!checked.value) {
    return props.markChainQuestList.includes(props.xp.id);
  } else {
    return false;
  }
});
const getDisableQuest: ComputedRef<boolean> = computed(() => props.disableQuestList.includes(props.xp.id));
const getQuestItem: ComputedRef<string> = computed(() => {
  if (props.quest.startedBy!['3' as keyof object]) {
    return props.quest.startedBy!['3' as keyof object]['1'];
  } else if (props.quest.objectives!['3' as keyof object]) {
    return props.quest.objectives!['3' as keyof object]['1']['1'];
  }
  return '';
});

const getQuestItemName: ComputedRef<string> = computed(() => {
  if (props.quest.startedBy!['3' as keyof object]) {
    return itemKeys[props.quest.startedBy!['3' as keyof object]['1']];
  } else if (props.quest.objectives!['3' as keyof object]) {
    return itemKeys[props.quest.objectives!['3' as keyof object]['1']['1']];
  }
  return '';
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

const checkQuest = (questId: string, questXp: number, questName: string, zone: string, checked: boolean): void => {
  if (checked && !chainedQuestList.length) {
    getPreQuestSingle(questId);
    getNextQuestInChain(questId);
    getPreQuestGroup(questId);
    getExclusiveTo(questId);
  }
  emit('check', questId, questXp, questName, zone, checked, chainedQuestList);
}

const checkForCompleted = async (questId: string): Promise<void> => {
  if (!questId) return;
  const checkForCompetedString = `/run print(C_QuestLog.IsQuestFlaggedCompleted(${questId}))`;
  await navigator.clipboard.writeText(checkForCompetedString).then(() => {
    checkForCompetedMsg.value = 'Copied! Paste in game chat'
  }
  , () => checkForCompetedMsg.value = 'Not copied!');
}

const checkForCompletedButtonOut = (): void => {
  checkForCompetedMsg.value = 'Check if you have completed this quest';
}

const getRaceImageUrl = (raceName: string): string => new URL(`./../assets/images/${raceName}-banner.webp`, import.meta.url).href;

const getSkillsImageUrl = (skillName: string): string => new URL(`./../assets/images/${skillName}.webp`, import.meta.url).href;

</script>
<template>
  <li :class="{'quest-row-mark': getMarkQuest}" class="quest-row">
    <div class="quest-first-row">
      <input 
        v-model="checked"
        @change="checkQuest(xp.id, xp.xp, quest.name, getQuestReturnZone, checked)"
        :disabled="getDisableQuest"
        type="checkbox">
      <span :class="getQuestDifficultyClass" class="quest-xp">{{ xp.xp }}</span>
      <a 
        :href="`https://www.wowhead.com/wotlk/quest=${xp.id}`"
        target="_blank"
        class="quest-name">{{ quest.name }}</a>
      <button 
        @click="checkForCompleted(xp.id)"
        @mouseout="checkForCompletedButtonOut()"
        :content="checkForCompetedMsg"
        v-tippy="{ hideOnClick: false }"
        class="quest-is-completed button">Completed?</button>
    </div>
    <div class="quest-second-row">
      <div>
        <span v-if="getQuestRequiredLevel > 0">{{ getQuestRequiredLevel }}</span>
        <span v-if="getQuestRequiredRaces" class="quest-race-image"><img :src="getRaceImageUrl(getQuestRequiredRaces)"></span>
        <span v-if="getQuestRequiredClass">{{ getQuestRequiredClass }}</span>
        <span v-if="getQuestRequiredSkill" class="quest-skill-image"><img :src="getSkillsImageUrl(getQuestRequiredSkill)"></span>
        <span v-if="getQuestChain" class="quest-chain-image" :content="questChainTooltipMsg" v-tippy></span>
        <a 
          v-if="getQuestItem"
          :href="`https://www.wowhead.com/wotlk/item=${getQuestItem}`"
          target="_blank"
          content="Quest item"
          v-tippy
          class="quest-item">{{ getQuestItemName }}</a>
      </div>
      <span class="quest-zone-return">{{ getQuestReturnZone }}</span>
    </div>
  </li>
</template>

<style scoped>
/* .quest-row {
  color: var(--color-text-2);
  background-color: var(--color-background-2);
}
.quest-row a {
  color: var(--color-text-2);
} */
</style>
