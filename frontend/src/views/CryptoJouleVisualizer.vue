<template>
  <main v-if="!loading">
    <div class="error" v-if="error">{{ error }}</div>
    <div class="loading" v-if="loading && !error">LOADING...</div>
    <h1 v-if="blockHeight && triQuanta">
      <small class="bitmap">{{ blockHeight }}<span>.bitmap</span></small>
      {{ triQuanta.getTriQuanta() }}
      <small class="dominant"
        >{{ triQuanta.getDominantForceName() }} (<span class="purple">{{
          blockForces[triQuanta.getDominantForceName()]
        }}</span
        >)</small
      >
      <small class="subdominant"
        >{{ triQuanta.getSubdominantForceName() }} (<span class="purple">{{
          blockForces[triQuanta.getSubdominantForceName()]
        }}</span
        >)</small
      >
      <small class="tertiary"
        >{{ triQuanta.getTertiaryForceName() }} (<span class="purple">{{
          blockForces[triQuanta.getTertiaryForceName()]
        }}</span
        >)</small
      >
    </h1>
    <CryptoJouleList
      v-if="cryptoJoules"
      :blockInfo="blockInfo"
      :blockHeight="blockHeight"
      :cryptoJoules="cryptoJoules"
    />
    <div class="cjs-loading" v-else>Scanning for Crypto-Joules...</div>
    <canvas id="cj-viz"></canvas>
  </main>
</template>
<script>
import { useCryptoJouleStore } from "@/stores/CryptoJouleStore.js";
import ByteModalities from "../../../src/lib/ByteModalities.js";
import TriQuanta from "../../../src/lib/TriQuanta.js";
import CryptoJouleLocator from "../../../src/lib/CryptoJouleLocator.js";

import CryptoJouleList from "@/components/CryptoJouleList.vue";

export default {
  name: "CryptoJouleVisualizer",
  components: {
    CryptoJouleList,
  },
  props: {
    blockHeight: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      blockInfo: null,
      byteModalities: null,
      triQuanta: null,
      blockForces: null,
      cryptoJoules: [],
      loading: true,
      error: null,
      cjStore: useCryptoJouleStore(),
    };
  },
  async mounted() {
    if(!this.cjStore.initialized) {
      await this.cjStore.initializeStore(this.blockHeight);
    }

    this.blockInfo = this.cjStore.blockInfo;
    this.byteModalities = this.cjStore.byteModalities;
    this.triQuanta = this.cjStore.triQuanta;
    this.blockForces = this.cjStore.blockForces;
    this.cryptoJoules = this.cjStore.cryptoJoules;
    this.loading = false;
  },
};
</script>
<style scoped>
main {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  line-height: 1.5;
  height: 100%;
  max-height: 100vh;
  width: 100%;
  font-size: 2rem;
  padding: 2rem;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1.5;
  max-height: 100vh;
  width: 100%;
  font-size: 2rem;
  padding: 2rem;
}

h1 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: 1.5em;
  max-height: 100vh;
  width: 100%;
  font-size: 3rem;
  color: var(--color-primary);
  z-index: 1000;

  small {
    font-size: 0.5em;
    line-height: 1.25em;
    color: var(--color-text);
    display: block;

    &:first-of-type {
      font-size: 0.67em;
      line-height: 0.67em;
      color: aliceblue;
    }

    &:first-of-type span {
      color: #ff6600;
    }

    &.dominant,
    &.subdominant,
    &.tertiary {
      font-size: 0.5em;
    }
  }
}

#cj-viz {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1.5;
  height: 100%;
  max-height: 100vh;
  width: 100%;
  font-size: 2rem;
  padding: 2rem;
  background-color: #000;
}
</style>
