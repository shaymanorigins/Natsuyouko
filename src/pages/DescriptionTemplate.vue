<template>
  <div>
    <h1>Description</h1>
    <h1>{{ allAnime?.english || allAnime?.romaji || allAnime?.native }}</h1>
    <img :src="allAnime?.imgBann" />
    <input v-on:change="updateEntry" v-model="currentEpisode" />
    <select v-on:change="updateEntry" v-model="watchStatus">
      <option value=""></option>
      <option value="plan to watch">Plan to Watch</option>
      <option value="watching">Watching</option>
      <option value="on hold">On Hold</option>
      <option value="completed">Completed</option>
      <option value="dropped">Dropped</option>
    </select>
    <p>
      {{ allAnime?.currentEpisode }}/{{ allAnime?.episodes }}, status:{{ allAnime?.watchStatus }}
    </p>
    <p v-html="allAnime?.description"></p>
    <div class="animeBoxD">
      <div
        :id="character.id.toString()"
        class="characterBox"
        v-for="character in allAnime?.characters.edges"
        :key="character.id"
      >
        <img :src="character.node.image.large" />
        <p>{{ character.node.name.full }}</p>
      </div>
    </div>
  </div>
</template>

<style>
body {
  padding: 1vw;
}

.animeBoxD {
  width: 80%;
  display: grid;
  margin: auto;
  grid-template-columns: repeat(5, 1fr);
  gap: 1vw;
}

.characterbox {
  display: grid;
  grid-template-rows: min-content auto;
  text-align: center;
  width: 80%;
  & img {
    border-radius: 5px;
    width: 100%;
    aspect-ratio: 1 / 1.5;
  }
}

@media only screen and (max-device-width: 320px) {
  .animeBoxD {
    width: 80%;
    display: grid;
    margin: auto;
    grid-template-columns: repeat(1, 1fr);
    gap: 1vw;
  }

  .characterbox {
    display: grid;
    grid-template-rows: min-content auto;
    text-align: center;
    width: 80%;
    margin: auto;
    & img {
      border-radius: 5px;
      width: 100%;
      aspect-ratio: 1 / 1.5;
    }
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { AnimeDB } from './HomePage.vue'

const route = useRoute()
const id = Number(route.params.id)
const allAnime = ref<AnimeDB>()
const currentEpisode = ref<number>()
const watchStatus = ref<string>()

const request = indexedDB.open('natsuyoukoDB')
request.onsuccess = () => {
  const db = request.result.transaction('anime', 'readonly').objectStore('anime').get(id)
  db.onsuccess = () => {
    allAnime.value = db.result
  }
}

async function updateEntry() {
  if (watchStatus.value == '') {
    currentEpisode.value = 0
  }
  if (watchStatus.value == 'completed') {
    currentEpisode.value = Number(allAnime.value?.episodes)
  }
  if (currentEpisode.value == allAnime.value?.episodes) {
    watchStatus.value = 'completed'
  }
  if (!currentEpisode.value || !watchStatus.value) return
  if (currentEpisode.value > (allAnime.value?.episodes ? allAnime.value?.episodes : 0)) return

  const db = request.result.transaction('anime', 'readonly').objectStore('anime').get(id)
  const animeObject = await new Promise<AnimeDB>((resolve) => {
    db.onsuccess = () => {
      resolve(db.result)
    }
  })

  if (animeObject) {
    animeObject.watchStatus = watchStatus.value
    animeObject.currentEpisode = currentEpisode.value
    const update = request.result
      .transaction('anime', 'readwrite')
      .objectStore('anime')
      .put(animeObject)
    update.onsuccess = () => {}
  }
}
</script>
