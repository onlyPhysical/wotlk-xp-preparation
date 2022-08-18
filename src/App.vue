<script setup lang="ts">
import { ref, computed } from "vue";
import type { Ref, ComputedRef } from "vue";

import MainContent from "./components/MainContent.vue";

const faction = ref('');
const repFaction = ref('');
const factionFilter: { faction: Ref<number>, repFaction: Ref<number> } = {
   faction: ref(0),
   repFaction: ref(0)
};

const getFaction = (selectFaction: string) => {
  if (faction.value === selectFaction) return;
  switch (selectFaction) {
    case 'alliance':
      factionFilter.faction.value = 690; // when selecting alliance we are actually filtering by horde
      faction.value = selectFaction;
      break;
    case 'horde':
      factionFilter.faction.value = 1101; // when selecting horde we are actually filtering by alliance
      faction.value = selectFaction;
      break;
    case 'aldor':
      factionFilter.repFaction.value =  934; // when selecting aldor we are actually filtering by scryers
      repFaction.value = selectFaction;
      break;
    case 'scryers':
      factionFilter.repFaction.value =  932; // when selecting scryers we are actually filtering by aldor
      repFaction.value = selectFaction;
      break;
  }
}

const factionFilterLength: ComputedRef<boolean> = computed(() => factionFilter.faction.value !== 0 && factionFilter.repFaction.value !== 0);
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>WOTLK classic XP preparation</h1>
    </div>
  </header>
    <div class="landing-block">
      <div class="faction-block">
        <span>Choose Faction</span>
        <div class="faction-wrap">
          <span @click="getFaction('alliance')" :class="{ selected: faction === 'alliance' }" class="faction-alliance">
            <span class="faction-icon"></span>
            <span class="faction-name">Alliance</span>
          </span>
          <span @click="getFaction('horde')" :class="{ selected: faction === 'horde' }" class="faction-horde">
            <span class="faction-icon"></span>
            <span class="faction-name">Horde</span>
            </span>
        </div>
      </div>
      <div class="faction-block">
        <span>Choose Shattrath Faction</span>
        <div class="faction-wrap">
          <span @click="getFaction('aldor')" :class="{ selected: repFaction === 'aldor' }" class="faction-aldor">
            <span class="faction-icon"></span>
            <span class="faction-name">Aldor</span>
          </span>
          <span @click="getFaction('scryers')" :class="{ selected: repFaction === 'scryers' }" class="faction-scryers">
            <span class="faction-icon"></span>
            <span class="faction-name">Scryers</span>
          </span>
        </div>
      </div>
    </div>
  <main>
    <MainContent v-if="factionFilterLength" :factionFilter="factionFilter" />
  </main>
</template>

<style>
@import "./assets/base.css";

#app {
  font-weight: normal;
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

a {
  text-decoration: none;
  color: var(--color-text);
  transition: 0.4s;
}

#app {
  display: grid;
  grid-template-rows: 80px auto;
}

header {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background-2);
}

header .wrapper {
  display: flex;
  place-items: flex-start;
  flex-wrap: wrap;
}

.logo {
  margin: 0 2rem 0 0;
}

.landing-block {
  display: flex;
  margin: 0 auto;
}

.faction-block {
  display: flex;
  flex-direction: column;
  padding: 0 20px;
}

.faction-block > span {
  text-align: center;
}

.faction-wrap {
  display: flex;
  text-align: center;
}

.faction-wrap > span {
  box-sizing: content-box;
  width: 80px;
  height: 80px;
  padding-bottom: 10px;
  margin: 0 10px;
  cursor: pointer;
  border-bottom: solid 3px transparent;
}

.faction-wrap .faction-icon {
  display: block;
  width: 64px;
  height: 64px;
  margin: 0 auto;
}

.faction-wrap .faction-alliance .faction-icon {
  background: url("./../public/images/alliance-banner.webp") no-repeat center;
}

.faction-wrap .faction-alliance.selected,
.faction-wrap .faction-alliance:hover {
  border-bottom: solid 3px #201ce0;
}

.faction-wrap .faction-horde .faction-icon {
  background: url("./../public/images/horde-banner.webp") no-repeat center;
}

.faction-wrap .faction-horde.selected,
.faction-wrap .faction-horde:hover {
  border-bottom: solid 3px #b00c08;
}

.faction-wrap .faction-aldor .faction-icon {
  background: url("./../public/images/aldor-faction.webp") no-repeat center;
}

.faction-wrap .faction-aldor.selected,
.faction-wrap .faction-aldor:hover {
  border-bottom: solid 3px #648fae;
}

.faction-wrap .faction-scryers .faction-icon {
  background: url("./../public/images/scryers-faction.webp") no-repeat center;
}

.faction-wrap .faction-scryers.selected,
.faction-wrap .faction-scryers:hover {
  border-bottom: solid 3px #b5774a;
}

main {
  display: flex;
  flex-direction: row;
  padding: 0 8rem;
}

.main-block {
  flex: 0 0 33%;
  padding: 0 1rem;
}

.main-block ul {
  padding: 0;
}

.main-block-header {
    display: flex;
    flex-direction: row;
    margin-top: 0.5rem;
}

.main-block-header h2 {
  margin-right: 10px;
}

.search-quest {
  width: 100%;
}
/* } */
</style>