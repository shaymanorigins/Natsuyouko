<template>
  <div class="buttonBox">
    <div>
      <button v-on:click="goBeginAnime">begin</button>
      <button v-on:click="goBackAnime">back</button>
      <input class="currentPage" v-on:change="goToPage(currentPage - 1)" v-model="currentPage" />
      <button v-on:click="loadAnime">forward</button>
      <button v-on:click="goEndAnime">end</button>
    </div>
    <div>
      <select v-model="itemAmount">
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
      <input id="searchBar" v-model="searchString" v-on:input="searchAnime" />
      <select v-model="searchIn" v-on:change="searchAnime">
        <option value="englishLower">English</option>
        <option value="romajiLower">Romaji</option>
        <option value="Native">Native</option>
      </select>
    </div>
  </div>

  <div class="animeWindow" v-if="allAnime.length > 0">
    <div
      class="animeBox"
      v-on:click="router.push(`/Description/${anime.id}`)"
      v-for="anime in allAnime"
      :key="anime.id"
    >
      <img :id="String(anime.id)" :src="anime.imgXL" />
      <p>{{ anime.english || anime.romaji || anime.native }}</p>
    </div>
    <div class="buttonBox">
      <div>
        <button v-on:click="goBeginAnime">begin</button>
        <button v-on:click="goBackAnime">back</button>
        <input class="currentPage" v-on:change="goToPage(currentPage - 1)" v-model="currentPage" />
        <button v-on:click="loadAnime">forward</button>
        <button v-on:click="goEndAnime">end</button>
      </div>
      <div>
        <p style="grid-column: 1/-1">Maximum pages = {{ pages || 1 }}</p>
      </div>
    </div>
  </div>
  <div v-else>
    <p>No anime available now</p>
  </div>
</template>

<style>
.currentPage {
  text-align: center;
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetch_all_anime } from '@/updates/Fetch_Anime'
import router from '@/router'

export type AnimeDB = {
  id: number
  english: string
  romaji: string
  native: string

  imgBann: string
  imgC: string
  imgM: string
  imgL: string
  imgXL: string

  description: string
  watchStatus: string
  currentEpisode: number
  episodes: number

  characters: {
    edges: {
      id: number
      role: string
      node: {
        id: number
        name: {
          full: string
          native: string
          alternative?: string[]
        }
        image: {
          large: string
          medium: string
        }
      }
    }[]
  }
}

const request = indexedDB.open('natsuyoukoDB')
const allAnime = ref<AnimeDB[]>([])
const searchString = ref('')
const currentPage = ref(0)
const pages = ref()
const itemAmount = ref(50)
const searchIn = ref('englishLower')
watch(itemAmount, () => {
  currentPage.value = 1
  goToPage(0)
})

request.onerror = () => {
  console.error(`Database error: ${request.error?.message}`)
}

request.onupgradeneeded = () => {
  const db = request.result
  const objectStore = db.createObjectStore('anime', { keyPath: 'id' })

  objectStore.createIndex('idMal', 'idMal', { unique: false })

  // Titles
  objectStore.createIndex('romajiLower', 'romajiLower', { unique: false })
  objectStore.createIndex('romaji', 'romaji', { unique: false })
  objectStore.createIndex('englishLower', 'englishLower', { unique: false })
  objectStore.createIndex('english', 'english', { unique: false })
  objectStore.createIndex('native', 'native', { unique: false })

  // Images
  objectStore.createIndex('imgXL', 'imgXL', { unique: false })
  objectStore.createIndex('imgL', 'imgL', { unique: false })
  objectStore.createIndex('imgM', 'imgM', { unique: false })
  objectStore.createIndex('imgC', 'imgC', { unique: false })
  objectStore.createIndex('imgBann', 'imgBann', { unique: false })

  objectStore.createIndex('description', 'description', { unique: false })
  objectStore.createIndex('characters', 'characters', { unique: false })
  objectStore.createIndex('watchStatus', 'watchStatus', { unique: false })
  objectStore.createIndex('currentEpisode', 'currentEpisode', { unique: false })
  objectStore.createIndex('episodes', 'episodes', { unique: false })
}

request.onsuccess = async () => {
  const db = request.result
  const animeCount = await new Promise<number>((resolve, reject) => {
    const animeObjectStore = db.transaction('anime', 'readonly').objectStore('anime').count()
    animeObjectStore.onsuccess = () => {
      resolve(animeObjectStore.result)
    }
    animeObjectStore.onerror = () => {
      reject(1)
    }
  })

  console.log('Anime Count: ', animeCount)
  if (Number(animeCount) == 0) {
    const allAnimeDB = await fetch_all_anime()
    console.log(allAnimeDB)
    const animeObjectStore = db.transaction('anime', 'readwrite').objectStore('anime')

    for (const anime of allAnimeDB) {
      const id = anime.id
      const idMal = anime.idMal

      const romaji = anime.title.romaji || ''
      const english = anime.title.english || ''
      const native = anime.title.native || ''

      const imgXL = anime.coverImage.extraLarge || ''
      const imgL = anime.coverImage.large || ''
      const imgM = anime.coverImage.medium || ''
      const imgC = anime.coverImage.color || ''
      const imgBann = anime.bannerImage || ''

      const description = anime.description || ''
      const characters = anime.characters || ''
      const episodes = anime.episodes

      animeObjectStore.add({
        id: id,
        idMal: idMal,
        romajiLower: romaji.toLowerCase(),
        romaji: romaji,
        englishLower: english.toLowerCase(),
        english: english,
        native: native,
        imgXL: imgXL,
        imgL: imgL,
        imgM: imgM,
        imgC: imgC,
        imgBann: imgBann,
        description: description,
        characters: characters,
        episodes: episodes,
      })
    }
    console.log("'anime' table has been filled")
    loadAnime()
  } else {
    console.log("'anime' is already filled.")
    loadAnime()
  }
}

async function loadAnime() {
  const countReq = request.result.transaction('anime', 'readonly').objectStore('anime').count()
  const totalPages = await new Promise<number>((resolve) => {
    countReq.onsuccess = () => {
      resolve(Math.ceil(countReq.result / itemAmount.value) - 1)
    }
  })
  if (currentPage.value >= totalPages + 1) {
    return
  }
  const lastIndex = allAnime.value.length - 1
  const lastItem = allAnime.value[lastIndex] || null
  const range = lastItem ? IDBKeyRange.lowerBound(lastItem?.id, true) : null
  const fetchNewAnime = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .getAll(range, itemAmount.value)

  fetchNewAnime.onsuccess = () => {
    allAnime.value = fetchNewAnime.result
  }
  if (currentPage.value == 0) {
    goToPage(currentPage.value - 1)
  }
  currentPage.value = Number(currentPage.value) + 1
}

function goBeginAnime() {
  currentPage.value = 0
  allAnime.value = []
  loadAnime()
}

async function goBackAnime() {
  if (currentPage.value == 1) {
    return
  } else {
    currentPage.value -= 1
  }
  const firstItem = allAnime.value[0] || null
  const range = firstItem ? IDBKeyRange.upperBound(firstItem.id) : null
  const lastPage = request.result.transaction('anime', 'readonly').objectStore('anime').count()
  const lastPageCount = await new Promise<number>((resolve) => {
    lastPage.onsuccess = () => {
      resolve(lastPage.result)
    }
  })

  const goBack = lastPageCount % itemAmount.value || itemAmount.value

  const tempRange = await new Promise((resolve) => {
    const cursor = request.result
      .transaction('anime', 'readonly')
      .objectStore('anime')
      .openCursor(range, 'prev')
    cursor.onsuccess = () => {
      if (allAnime.value.length < goBack) {
        cursor.result?.advance(goBack - 1)
        cursor.onsuccess = () => {
          resolve(cursor.result?.key)
        }
      } else {
        cursor.result?.advance(itemAmount.value)
        cursor.onsuccess = () => {
          resolve(cursor.result?.key)
        }
      }
    }
  })

  const newRange = IDBKeyRange.lowerBound(tempRange)
  if (allAnime.value.length < goBack) {
    const fetchOldAnime = request.result
      .transaction('anime', 'readonly')
      .objectStore('anime')
      .getAll(newRange, goBack)

    fetchOldAnime.onsuccess = () => {
      allAnime.value = fetchOldAnime.result
    }
  } else {
    const fetchOldAnime = request.result
      .transaction('anime', 'readonly')
      .objectStore('anime')
      .getAll(newRange, itemAmount.value)

    fetchOldAnime.onsuccess = () => {
      allAnime.value = fetchOldAnime.result
    }
  }
}

async function goEndAnime() {
  const lastPageItems = request.result.transaction('anime', 'readonly').objectStore('anime').count()
  const lastPageCount = await new Promise<number>((resolve) => {
    lastPageItems.onsuccess = () => {
      resolve(lastPageItems.result)
    }
  })

  const goBack = lastPageCount % itemAmount.value || itemAmount.value
  const pointer = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .openCursor(null, 'prev')
  const startAnime = Number(
    await new Promise((resolve) => {
      pointer.onsuccess = () => {
        pointer.result?.advance(goBack - 1)
        pointer.onsuccess = () => {
          resolve(pointer.result?.key)
        }
      }
    }),
  )

  const keyrange = IDBKeyRange.lowerBound(startAnime)
  const fetchEndAnime = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .getAll(keyrange, goBack)
  fetchEndAnime.onsuccess = () => {
    allAnime.value = fetchEndAnime.result
    currentPage.value = pages.value
  }
}

async function searchAnime() {
  if (searchString.value == '') {
    await goBeginAnime()
    return
  }
  const range = IDBKeyRange.bound(
    searchString.value.toLocaleLowerCase(),
    searchString.value.toLocaleLowerCase() + '\uffff',
  )
  const db = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .index(`${searchIn.value}`)
    .getAll(range, 1000)

  db.onsuccess = () => {
    allAnime.value = db.result
  }
}

async function goToPage(page: number) {
  const transaction = request.result.transaction('anime', 'readonly').objectStore('anime').count()
  let key
  const items = await new Promise<number>((resolve) => {
    transaction.onsuccess = () => {
      resolve(transaction.result)
    }
  })
  if (items) {
    pages.value = Math.ceil(items / itemAmount.value)
    if (page > pages.value) {
      page = pages.value - 1
      currentPage.value = pages.value
    }
  }
  if (page > 0) {
    const cursor = request.result
      .transaction('anime', 'readwrite')
      .objectStore('anime')
      .openCursor()
    key = await new Promise((resolve) => {
      cursor.onsuccess = () => {
        if (cursor.result) {
          cursor.result?.advance(page * itemAmount.value)
          cursor.onsuccess = () => {
            resolve(cursor.result?.key || null)
          }
        } else {
          resolve(null)
        }
      }
    })
  }
  const range = key ? IDBKeyRange.lowerBound(key) : null
  const resolve = request.result
    .transaction('anime', 'readonly')
    .objectStore('anime')
    .getAll(range, itemAmount.value)
  resolve.onsuccess = () => {
    allAnime.value = resolve.result
  }
}
</script>
