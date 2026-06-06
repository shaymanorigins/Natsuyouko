<template>
  <nav class="animeNav">
    <RouterLink to="/MyAnime/all">All</RouterLink>
    <RouterLink to="/MyAnime/watching">Watching</RouterLink>
    <RouterLink to="/MyAnime/on_hold">On Hold</RouterLink>
    <RouterLink to="/MyAnime/dropped">Dropped</RouterLink>
    <RouterLink to="/MyAnime/completed">Completed</RouterLink>
    <RouterLink to="/MyAnime/plan_to_watch">Plan To Watch</RouterLink>
  </nav>
  <div
    v-if="(status === 'all' || status === 'watching') && myAnimeW.length > 0"
    class="visibilitySwitch"
  >
    <h1>Watching</h1>
    <hr />
    <div class="animeDescBox" :id="anime.id.toString()" v-for="anime in myAnimeW" :key="anime.id">
      <img :src="anime.imgM" />
      <p>
        {{ anime.english || anime.romaji || anime.native }}: {{ anime.currentEpisode }}/{{
          anime.episodes
        }}, Status: {{ anime.watchStatus }}
      </p>
    </div>
  </div>
  <div
    v-if="(status === 'all' || status === 'on_hold') && myAnimeO.length > 0"
    class="visibilitySwitch"
  >
    <h1>On Hold</h1>
    <hr />
    <div :id="anime.id.toString()" v-for="anime in myAnimeO" :key="anime.id">
      <img :src="anime.imgM" />
      <p>
        {{ anime.english || anime.romaji || anime.native }}: {{ anime.currentEpisode }}/{{
          anime.episodes
        }}, Status: {{ anime.watchStatus }}
      </p>
    </div>
  </div>
  <div
    v-if="(status === 'all' || status === 'dropped') && myAnimeD.length > 0"
    class="visibilitySwitch"
  >
    <h1>Dropped</h1>
    <hr />
    <div :id="anime.id.toString()" v-for="anime in myAnimeD" :key="anime.id">
      <img :src="anime.imgM" />
      <p>
        {{ anime.english || anime.romaji || anime.native }}: {{ anime.currentEpisode }}/{{
          anime.episodes
        }}, Status: {{ anime.watchStatus }}
      </p>
    </div>
  </div>
  <div
    v-if="(status === 'all' || status === 'completed') && myAnimeC.length > 0"
    class="visibilitySwitch"
  >
    <h1>Completed</h1>
    <hr />
    <div :id="anime.id.toString()" v-for="anime in myAnimeC" :key="anime.id">
      <img :src="anime.imgM" />
      <p>
        {{ anime.english || anime.romaji || anime.native }}: {{ anime.currentEpisode }}/{{
          anime.episodes
        }}, Status: {{ anime.watchStatus }}
      </p>
    </div>
  </div>
  <div
    v-if="(status === 'all' || status === 'plan_to_watch') && myAnimeP.length > 0"
    class="visibilitySwitch"
  >
    <h1>Plan To Watch</h1>
    <hr />
    <div :id="anime.id.toString()" v-for="anime in myAnimeP" :key="anime.id">
      <img :src="anime.imgM" />
      <p>
        {{ anime.english || anime.romaji || anime.native }}: {{ anime.currentEpisode }}/{{
          anime.episodes
        }}, Status: {{ anime.watchStatus }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AnimeDB } from './HomePage.vue'
import { useRoute } from 'vue-router'

const myAnimeC = ref<AnimeDB[]>([])
const myAnimeD = ref<AnimeDB[]>([])
const myAnimeO = ref<AnimeDB[]>([])
const myAnimeP = ref<AnimeDB[]>([])
const myAnimeW = ref<AnimeDB[]>([])

const route = useRoute()
const status = ref(computed(() => String(route.params.status ?? 'all')))

const request = indexedDB.open('natsuyoukoDB')
request.onsuccess = async () => {
  const fetchMyAnimeC = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .index('watchStatus')
    .getAll('completed')
  myAnimeC.value = await new Promise((resolve) => {
    fetchMyAnimeC.onsuccess = () => {
      resolve(fetchMyAnimeC.result)
    }
  })
  const fetchMyAnimeD = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .index('watchStatus')
    .getAll('dropped')
  myAnimeD.value = await new Promise((resolve) => {
    fetchMyAnimeD.onsuccess = () => {
      resolve(fetchMyAnimeD.result)
    }
  })
  const fetchMyAnimeO = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .index('watchStatus')
    .getAll('on_hold')
  myAnimeO.value = await new Promise((resolve) => {
    fetchMyAnimeO.onsuccess = () => {
      resolve(fetchMyAnimeO.result)
    }
  })
  const fetchMyAnimeP = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .index('watchStatus')
    .getAll('plan_to_watch')
  myAnimeP.value = await new Promise((resolve) => {
    fetchMyAnimeP.onsuccess = () => {
      resolve(fetchMyAnimeP.result)
    }
  })
  const fetchMyAnimeW = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .index('watchStatus')
    .getAll('watching')
  myAnimeW.value = await new Promise((resolve) => {
    fetchMyAnimeW.onsuccess = () => {
      resolve(fetchMyAnimeW.result)
    }
  })
}
</script>
