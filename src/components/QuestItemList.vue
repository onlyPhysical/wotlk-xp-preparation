<script setup lang="ts">
import xpItemList from "../../public/data/xpItemData.json";
import questItemList from "../../public/data/questItemData.json";
import { ref, computed, watch, onMounted } from "vue";
import type { Ref, ComputedRef } from "vue";

import QuestItem from "./QuestItem.vue";

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
  chainedGlobal: { chainedGlobalQuestId: Ref<string>, chainedGlobalMarkQuest: Ref<string[]> };
}>();
const emit = defineEmits<{
  (e: 'check', questId: string, checked: boolean, markChainQuestItemList: string[]): void;
}>();

const searchQuestTerm = ref('');
const xpItemListResult: Ref<Xp[]> = ref(xpItemList);
const questItemListResult = ref(JSON.parse(JSON.stringify(questItemList)));
const questItemListSelected: Ref<Array<{ id: string, xp: number }>> = ref([]);
const questItemListSelectedXp = ref(0);

onMounted(() => {
  xpListResultFilter();
})

watch(props, (newProps) => {
  if (newProps.factionFilter) {
    questItemListResult.value = JSON.parse(JSON.stringify(questItemList));
    xpListResultFilter();
    // TODO when changing factions
  }
});

const xpListResultFilter = (): void => {
  xpItemListResult.value = xpItemList;
  xpItemListResult.value = xpItemListResult.value.filter(key => {
    const factionFilter = key.requiredRaces !== props.factionFilter.faction.value && key.requiredRepFaction !== props.factionFilter.repFaction.value;
    if (!factionFilter) {
      delete questItemListResult.value[key.id as keyof object];
    }
    return factionFilter;
  });
}

const searchQuest = (): void => {
  if (searchQuestTerm.value.length === 0) {
    xpListResultFilter();
  }
  if (searchQuestTerm.value.length < 3) return;
  const questItemListSearchResult = Object.entries(questItemListResult.value)
    .filter((quest: [string, any]) => {
      const questNameLowerCase = quest[1]['name'].toLowerCase();
      const searchQuestTermLowerCase = searchQuestTerm.value.toLowerCase();
      return questNameLowerCase.includes(searchQuestTermLowerCase);
    });
  if (questItemListSearchResult.length > 0) {
    const questItemListSearchResultKeys = Object.keys(Object.fromEntries(questItemListSearchResult));
    xpItemListResult.value = xpItemList.filter((key) => questItemListSearchResultKeys.includes(key.id));
  }
};

const checkQuest = (questId: string, questXp: number, checked: boolean, chainedQuestList: string[]) => {
  if (checked) {
    const quest = {
      id: questId,
      xp: questXp
    };
    questItemListSelected.value = [...questItemListSelected.value, quest];
    // questListSelectedXp.value = questListSelectedXp.value + questXp; TODO better handling of xp accumulation
    if (chainedQuestList.length) {
      questItemListSelected.value = questItemListSelected.value
        .filter((key) => !chainedQuestList.includes(key.id));
    }
  } else {
    questItemListSelected.value = questItemListSelected.value.filter((key) => key.id !== questId);
    // questListSelectedXp.value = questListSelectedXp.value - questXp; TODO better handling of xp accumulation
  }
  console.warn(questId, 'questId', checked)
  emit('check', questId, checked, chainedQuestList);
};
</script>

<template>
  <!-- <pre>{{ questItemList['11041'] }}</pre> -->
  <div class="main-block-header">
    <h2>Quests</h2>
    <input v-model.trim="searchQuestTerm" @input="searchQuest()" class="search-quest" placeholder="Quest name">
  </div>
  <ul>
    <QuestItem
      @check="checkQuest"
      v-for="xp in xpItemListResult"
      :xp="xp"
      :quest="questItemList[xp.id as keyof object]"
      :chainedGlobal="chainedGlobal"
      :key="xp.id" />
  </ul>
</template>
