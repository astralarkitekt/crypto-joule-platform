<template>
  <header v-if="showHeader">
    <img src="/crypto-joule-logo.png" alt="Crypto-Joule Tri-Quanta Forces" class="logo" />
    <h1>Crypto-Joule:<small>Terraform Your Bitmap</small></h1>
  </header>
  
  <RouterView />
</template>
<script>
import { RouterLink, RouterView } from 'vue-router'
export default {
  computed: {
    showHeader() {
      return this.$route.name !== 'visualizer'
    }
  },
}
</script>
<style scoped>
header {
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1.5;
  max-height: 100vh;
  width: 100%;

  img {
    width: auto;
    max-height: 128px;
  }

  h1 {
    padding-top: 1.5rem;
    font-size: 4rem;
    line-height: 0.67em;
    margin: 0;
    color: var(--color-primary);

    small {
      color: var(--color-text);
      display: block;
    }
  }
}

.logo {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
