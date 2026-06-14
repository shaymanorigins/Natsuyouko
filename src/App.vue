<template>
  <nav class="mainNav">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/MyAnime/all">Interactions</RouterLink>
  </nav>
  <RouterView></RouterView>
  <img id="tmpnameShow" src="/src/images/tmpName.png" alt="" />
  <footer></footer>
</template>

<style>
@import 'styles/Main.css';
</style>

<script setup lang="ts"></script>
