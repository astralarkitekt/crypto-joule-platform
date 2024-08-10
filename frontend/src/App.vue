<template>
  <header v-if="showHeader">
    <img
      src="/crypto-joule-logo.png"
      alt="Crypto-Joule Tri-Quanta Forces"
      class="logo"
    />
    <h1>Crypto-Joule:<small>Terraform Your Bitmap</small></h1>
  </header>
  <div class="error" v-if="error">
    <h2>ERROR:</h2>
    <pre>{{ error }}</pre>
  </div>
  <RouterView />
</template>
<script>
import { useRoute } from "vue-router";
import { ref, onMounted, watch } from "vue";
import { useCryptoJouleStore } from "@/stores/CryptoJouleStore.js";

export default {
  data() {
    return {
      error: null,
    };
  },
  computed: {
    showHeader() {
      return (
        this.$route.name !== "visualizer" && this.$route.name !== "explore"
      );
    },
  },
};
</script>
<style scoped>
header {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  line-height: 1.5;
  max-height: 100vh;
  width: 100%;

  img {
    width: auto;
    max-height: 128px;
    margin-top: 1rem;
  }

  h1 {
    padding-top: 1.5rem;
    font-size: 3rem;
    line-height: 1em;
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
