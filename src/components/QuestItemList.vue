<script setup lang="ts">
import xpItemList from "../../public/data/xpItemData.json";
import questItemList from "../../public/data/questItemData.json";
import { ref, watch, onMounted } from "vue";
import type { Ref } from "vue";

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
  chainedGlobal: { chainedGlobalQuestId: Ref<string>, chainedGlobalQuestChecked: Ref<boolean>, chainedGlobalMarkQuest: Ref<string[]> };
}>();
const emit = defineEmits<{
  (e: 'check', questId: string, questListSelected: { questId: string, questXp: number, questName: string, zone: string }, checked: boolean, markChainQuestItemList: string[]): void;
}>();

const searchQuestTerm = ref('');
const xpItemListResult: Ref<Xp[]> = ref(xpItemList);
const questItemListResult = ref(JSON.parse(JSON.stringify(questItemList)));
const questItemListSelected: Ref<{ questId: string, questXp: number, questName: string, zone: string }> = ref({
  questId: '',
  questXp: 0,
  questName: '',
  zone: ''
});
const markChainQuestList: Ref<string[]> = ref([]);
const disableQuestList: Ref<string[]> = ref([]);

onMounted(() => {
  xpListResultFilter();
})

watch([props.factionFilter.faction, props.factionFilter.repFaction], (newProps) => {
  if (newProps) {
    questItemListResult.value = JSON.parse(JSON.stringify(questItemList));
    xpListResultFilter();
  }
});

watch([props.chainedGlobal.chainedGlobalQuestId, props.chainedGlobal.chainedGlobalQuestChecked], (newProps) => {
  if (newProps) {
    if (props.chainedGlobal.chainedGlobalQuestChecked.value) {
      disableQuestList.value = [...disableQuestList.value, props.chainedGlobal.chainedGlobalQuestId.value];
    } else {
      disableQuestList.value = disableQuestList.value.filter((key) => ![props.chainedGlobal.chainedGlobalQuestId.value].includes(key));
    }
  }
});

watch(props.chainedGlobal.chainedGlobalMarkQuest, (newProps) => {
  if (newProps) {
    if (props.chainedGlobal.chainedGlobalQuestChecked.value) {
      markChainQuestList.value = [...markChainQuestList.value, ...props.chainedGlobal.chainedGlobalMarkQuest.value]
        .filter((val, index, self) => self.indexOf(val) === index);
    } else {
      markChainQuestList.value = markChainQuestList.value.filter((key) => props.chainedGlobal.chainedGlobalMarkQuest.value.includes(key));
    }
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
  } else {
    xpItemListResult.value = [];
  }
};

const checkQuest = (questId: string, questXp: number, questName: string, zone: string, checked: boolean, chainedQuestList: string[]) => {
  if (checked) {
    const quest = {
      questId: questId,
      questXp: questXp,
      questName: questName,
      zone: zone
    };
    questItemListSelected.value = quest;
    if (chainedQuestList.length) {
      markChainQuestList.value = [...markChainQuestList.value, ...chainedQuestList]
        .filter((val, index, self) => self.indexOf(val) === index)
        .filter(val => val !== questId);
    }
  } else {
    markChainQuestList.value = markChainQuestList.value.filter(val => !chainedQuestList.includes(val));
  }
  emit('check', questId, questItemListSelected.value, checked, markChainQuestList.value);
};

</script>

<template>
  <!-- <pre>{{ questItemList['11041'] }}</pre> -->
  <div class="main-block-header">
    <h2>Quests</h2>
    <input v-model.trim="searchQuestTerm" @input="searchQuest()" class="search-quest input-field" placeholder="Quest name">
  </div>
  <ul>
    <QuestItem
      @check="checkQuest"
      v-for="xp in xpItemListResult"
      :xp="xp"
      :quest="questItemList[xp.id as keyof object]"
      :factionFilter="factionFilter"
      :markChainQuestList="markChainQuestList"
      :disableQuestList="disableQuestList"
      :key="xp.id" />
  </ul>
</template>
