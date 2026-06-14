<template>
  <div class="descBox">
    <h1>{{ allAnime?.english || allAnime?.romaji || allAnime?.native }}</h1>
    <img class="imgBann" :src="allAnime?.imgBann" />
    <button v-on:click="minEpisode(id)">-</button>
    <input v-on:change="updateEpisode" v-model="currentEpisode" />
    <button v-on:click="plusEpisode(id)">+</button>
    <select v-on:change="updateEntry" v-model="watchStatus">
      <option value="completed">Completed</option>
      <option value="dropped">Dropped</option>
      <option value="on_hold">On Hold</option>
      <option value="plan_to_watch">Plan to Watch</option>
      <option value="watching">Watching</option>
    </select>
    <p>
      {{ allAnime?.currentEpisode }}/{{ allAnime?.episodes || '??' }}, status:{{ editWatchStatus }}
    </p>
    <p v-html="allAnime?.description"></p>
    <div class="animeWindow">
      <div
        :id="character.id.toString()"
        class="animeBox"
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
.imgBann {
  width: 100%;
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
const editWatchStatus = ref<string>()

const request = indexedDB.open('natsuyoukoDB')
request.onsuccess = () => {
  const db = request.result.transaction('anime', 'readonly').objectStore('anime').get(id)
  db.onsuccess = () => {
    allAnime.value = db.result

    currentEpisode.value = db.result.currentEpisode
    watchStatus.value = db.result.watchStatus
  }
}

async function updateEntry() {
  if (watchStatus.value == 'completed') {
    currentEpisode.value = Number(allAnime.value?.episodes)
  }
  if (currentEpisode.value === undefined || watchStatus.value === undefined) return
  if (allAnime.value) {
    if (currentEpisode.value > allAnime.value.episodes && allAnime.value.episodes != null) {
      currentEpisode.value = allAnime.value.episodes
      await updateEpisode()
    }
  }

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
    update.onsuccess = () => {
      if (allAnime.value) {
        allAnime.value.watchStatus = animeObject.watchStatus
        allAnime.value.currentEpisode = animeObject.currentEpisode
      }
      if (allAnime.value?.watchStatus) {
        editWatchStatus.value = allAnime.value.watchStatus.replaceAll('_', ' ')
      }
      watchStatus.value = animeObject.watchStatus
      currentEpisode.value = animeObject.currentEpisode
    }
  }
}

async function updateEpisode() {
  if (allAnime.value && !(currentEpisode.value === undefined)) {
    if (currentEpisode.value == allAnime.value.episodes || allAnime.value.episodes == null) {
      watchStatus.value = 'completed'
    }
    if (currentEpisode.value < allAnime.value.episodes || allAnime.value.episodes == null) {
      watchStatus.value = 'watching'
    }
  }
  await updateEntry()
}

async function plusEpisode(id: number) {
  const transaction = request.result.transaction('anime', 'readwrite').objectStore('anime').get(id)
  const tempTransaction = await new Promise<AnimeDB>((resolve) => {
    transaction.onsuccess = () => {
      resolve(transaction.result)
    }
  })

  if (tempTransaction) {
    tempTransaction.currentEpisode = Number(tempTransaction.currentEpisode) + 1 || 1
  }

  const update = request.result
    .transaction('anime', 'readwrite')
    .objectStore('anime')
    .put(tempTransaction)
  update.onsuccess = () => {
    currentEpisode.value = tempTransaction.currentEpisode
    updateEpisode()
  }
}

async function minEpisode(id: number) {
  const transaction = request.result.transaction('anime', 'readwrite').objectStore('anime').get(id)
  const tempTransaction = await new Promise<AnimeDB>((resolve) => {
    transaction.onsuccess = () => {
      resolve(transaction.result)
    }
  })

  if (tempTransaction) {
    if (tempTransaction.watchStatus == 'completed') {
      watchStatus.value = 'watching'
    }
    tempTransaction.currentEpisode -= 1
  }

  const update = request.result
    .transaction('anime', 'readwrite')
    .objectStore('anime')
    .put(tempTransaction)
  update.onsuccess = () => {
    currentEpisode.value = tempTransaction.currentEpisode
    updateEpisode()
  }
}
</script>
