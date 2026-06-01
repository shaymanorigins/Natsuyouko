<template>
  <div>
    <h1>Description</h1>
    <h1>{{ allAnime?.english || allAnime?.romaji || allAnime?.native }}</h1>
    <img :src="allAnime?.imgBann" />
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { AnimeDB } from './HomePage.vue'

const route = useRoute()
const id = Number(route.params.id)
const allAnime = ref<AnimeDB>()

onMounted(() => {
  const request = indexedDB.open('natsuyoukoDB')
  request.onsuccess = () => {
    const db = request.result.transaction('anime', 'readonly').objectStore('anime').get(id)

    db.onsuccess = () => {
      allAnime.value = db.result
      console.log(allAnime.value?.characters.edges)
    }
  }
})
</script>
