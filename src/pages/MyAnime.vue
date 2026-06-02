<template>
  <div>MyAnime</div>
  <h1>Completed</h1>
  <hr />
  <div :id="anime.id.toString()" v-for="anime in myAnime1" :key="anime.id">
    <p>
      {{ anime.english || anime.romaji || anime.native }}: {{ anime.currentEpisode }}/{{
        anime.episodes
      }}, Status: {{ anime.watchStatus }}
    </p>
  </div>
  <hr />
  <h1>Watching</h1>
  <hr />
  <div :id="anime.id.toString()" v-for="anime in myAnime" :key="anime.id">
    <p>
      {{ anime.english || anime.romaji || anime.native }}: {{ anime.currentEpisode }}/{{
        anime.episodes
      }}, Status: {{ anime.watchStatus }}
    </p>
  </div>
  <hr />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AnimeDB } from './HomePage.vue'

const myAnime = ref<AnimeDB[]>([])
const myAnime1 = ref<AnimeDB[]>([])
const request = indexedDB.open('natsuyoukoDB')
request.onsuccess = async () => {
  const fetchMyAnime = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .index('watchStatus')
    .getAll('watching')
  myAnime.value = await new Promise((resolve) => {
    fetchMyAnime.onsuccess = () => {
      resolve(fetchMyAnime.result)
    }
  })
  const fetchMyAnime1 = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .index('watchStatus')
    .getAll('completed')
  myAnime1.value = await new Promise((resolve) => {
    fetchMyAnime1.onsuccess = () => {
      resolve(fetchMyAnime1.result)
    }
  })
}
</script>
