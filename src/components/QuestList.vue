<script setup lang="ts">
import xpList from "../../public/data/xpData.json";
import questList from "../../public/data/questData.json";
import questItemList from "../../public/data/questItemData.json";
import { ref, computed, watch, onMounted } from "vue";
import type { Ref, ComputedRef } from "vue";

import Quest from "./Quest.vue";

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
  factionFilter: { faction: Ref<number>, repFaction: Ref<number> };
}>();

const QUEST_LIST_STEP = 15;

const searchQuestTerm = ref('');
const hasSearchResult = ref(false);
const questListNumber = ref(QUEST_LIST_STEP);
const xpListTotal = ref(xpList.length);
const xpListResult: Ref<Xp[]> = ref(xpList);
const questListResult = ref(JSON.parse(JSON.stringify(questList)));
const questListSelected: Ref<Array<{ id: string, xp: number }>> = ref([]);
const questListSelectedXp = ref(0);
const disableChainQuestList: Ref<string[]> = ref([]);

const showMoreQuestButton: ComputedRef<boolean> = computed(() => (xpListTotal.value > questListNumber.value) && !hasSearchResult.value);

onMounted(() => {
  xpListResultFilter();
})

watch(props, (newProps) => {
  if (newProps.factionFilter) {
    questListResult.value = JSON.parse(JSON.stringify(questList));
    xpListResultFilter();
    // TODO when changing factions
  }
});

const xpListResultFilter = (): void => {
  xpListResult.value = xpList;
  xpListResult.value = xpListResult.value.filter(key => {
    const factionFilter = key.requiredRaces !== props.factionFilter.faction.value && key.requiredRepFaction !== props.factionFilter.repFaction.value;
    if (!factionFilter) {
      delete questListResult.value[key.id as keyof object];
    }
    return factionFilter;
  });
  xpListTotal.value = xpListResult.value.length;
}

const searchQuest = (): void => {
  if (searchQuestTerm.value.length === 0) {
    hasSearchResult.value = false;
    xpListResultFilter();
  }
  if (searchQuestTerm.value.length < 3) return;
  const questListSearchResult = Object.entries(questListResult.value)
    .filter((quest: [string, any]) => {
      const questNameLowerCase = quest[1]['name'].toLowerCase();
      const searchQuestTermLowerCase = searchQuestTerm.value.toLowerCase();
      return questNameLowerCase.includes(searchQuestTermLowerCase);
    });
  if (questListSearchResult.length > 0) {
    hasSearchResult.value = true;
    const questListSearchResultKeys = Object.keys(Object.fromEntries(questListSearchResult));
    xpListResult.value = xpList.filter((key) => questListSearchResultKeys.includes(key.id));
  }
};

const showMoreQuest = (): void => { questListNumber.value = questListNumber.value + QUEST_LIST_STEP };

const addQuest = (questId: string, questXp: number, checked: boolean, chainedQuestList: string[]) => {
  if (checked) {
    const quest = {
      id: questId,
      xp: questXp
    };
    questListSelected.value = [...questListSelected.value, quest];
    // questListSelectedXp.value = questListSelectedXp.value + questXp; TODO better handling of xp accumulation
    console.warn('questListSelected', questListSelected.value);
    if (chainedQuestList.length) {
      questListSelected.value = questListSelected.value
        .filter((key) => !chainedQuestList.includes(key.id));
      disableChainQuestList.value = [...disableChainQuestList.value, ...chainedQuestList]
        .filter((val, index, self) => self.indexOf(val) === index)
        .filter(val => val !== questId);
    }
  } else {
    questListSelected.value = questListSelected.value.filter((key) => key.id !== questId);
    // questListSelectedXp.value = questListSelectedXp.value - questXp; TODO better handling of xp accumulation
    disableChainQuestList.value = disableChainQuestList.value.filter(val => !chainedQuestList.includes(val));
    console.warn('not checked disableChainQuestList.value', disableChainQuestList.value);
  }
};
</script>

<template>
  <!-- <pre>{{ questList['10091'] }}</pre> -->
  <div class="main-block-header">
    <h2>Quests</h2>
    <input v-model.trim="searchQuestTerm" @input="searchQuest()" class="search-quest" placeholder="Quest name">
  </div>
  <ul>
    <Quest
      @change="addQuest"
      v-for="xp in xpListResult.slice(0, questListNumber)"
      :xp="xp"
      :quest="questList[xp.id as keyof object]"
      :disableQuest="disableChainQuestList"
      :key="xp.id" />
  </ul>
  <button v-if="showMoreQuestButton" @click="showMoreQuest()">Show {{ QUEST_LIST_STEP }} more quest of {{ (xpListTotal - questListNumber) }}</button>
</template>
