<script setup lang="ts">
import xpList from "../../public/data/xpData.json";
import questList from "../../public/data/questData.json";
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
const disableQuestList: Ref<string[]> = ref([]);

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
    questListSelectedXp.value = questListSelectedXp.value + questXp;
    if (chainedQuestList.length) {
      disableQuestList.value = [...disableQuestList.value, ...chainedQuestList]
        .filter((val, index, self) => self.indexOf(val) === index)
        .filter(val => val !== questId);
    }
  } else {
    questListSelected.value = questListSelected.value.filter((key) => key.id !== questId);
    questListSelectedXp.value = questListSelectedXp.value - questXp;
    disableQuestList.value = disableQuestList.value.filter(val => !chainedQuestList.includes(val));
    console.warn('not checked disableQuestList.value', disableQuestList.value);
  }
};
</script>

<template>
  <div class="main-block">
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
        :disableQuest="disableQuestList"
        :key="xp.id" />
    </ul>
    <button v-if="showMoreQuestButton" @click="showMoreQuest()">Show {{ QUEST_LIST_STEP }} more quest of {{ (xpListTotal - questListNumber) }}</button>
  </div>
  <div class="main-block">
    {{ questListSelectedXp }}
    <li v-for="selectedQuest in questListSelected">
      <div>
        <span>{{ selectedQuest.xp }}</span>
        <a 
          :href="`https://www.wowhead.com/wotlk/quest=${selectedQuest.id}`"
          :data-wowhead="`quest=${selectedQuest.id}`"
          target="_blank">{{ questList[selectedQuest.id as keyof object]['name'] }}</a>
      </div>
    </li>
  </div>
  <div class="main-block">
    
  </div>
  <!-- <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Documentation</template>

    Vue’s
    <a target="_blank" href="https://vuejs.org/">official documentation</a>
    provides you with all information you need to get started.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <ToolingIcon />
    </template>
    <template #heading>Tooling</template>

    This project is served and bundled with
    <a href="https://vitejs.dev/guide/features.html" target="_blank">Vite</a>.
    The recommended IDE setup is
    <a href="https://code.visualstudio.com/" target="_blank">VSCode</a> +
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>.
    If you need to test your components and web pages, check out
    <a href="https://www.cypress.io/" target="_blank">Cypress</a> and
    <a href="https://on.cypress.io/component" target="_blank"
      >Cypress Component Testing</a
    >.

    <br />

    More instructions are available in <code>README.md</code>.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <EcosystemIcon />
    </template>
    <template #heading>Ecosystem</template>

    Get official tools and libraries for your project:
    <a target="_blank" href="https://pinia.vuejs.org/">Pinia</a>,
    <a target="_blank" href="https://router.vuejs.org/">Vue Router</a>,
    <a target="_blank" href="https://test-utils.vuejs.org/">Vue Test Utils</a>,
    and
    <a target="_blank" href="https://github.com/vuejs/devtools">Vue Dev Tools</a
    >. If you need more resources, we suggest paying
    <a target="_blank" href="https://github.com/vuejs/awesome-vue"
      >Awesome Vue</a
    >
    a visit.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>Community</template>

    Got stuck? Ask your question on
    <a target="_blank" href="https://chat.vuejs.org">Vue Land</a>, our official
    Discord server, or
    <a target="_blank" href="https://stackoverflow.com/questions/tagged/vue.js"
      >StackOverflow</a
    >. You should also subscribe to
    <a target="_blank" href="https://news.vuejs.org">our mailing list</a> and
    follow the official
    <a target="_blank" href="https://twitter.com/vuejs">@vuejs</a>
    twitter account for latest news in the Vue world.
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <SupportIcon />
    </template>
    <template #heading>Support Vue</template>

    As an independent project, Vue relies on community backing for its
    sustainability. You can help us by
    <a target="_blank" href="https://vuejs.org/sponsor/">becoming a sponsor</a>.
  </WelcomeItem> -->
</template>
