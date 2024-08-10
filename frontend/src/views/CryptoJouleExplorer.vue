<template>
  <main>
    <div class="loading">
      <h1 v-if="loading">
        <img src="/crypto-joule-logo.png" alt="Crypto-Joule Tri-Quanta Forces" class="logo" />
        LOADING...
        <span>{{ txIndex }}:{{ byteIndex }}.{{ blockHeight }}.bitmap</span>
      </h1>
    </div>
    <div id="explorer"></div>
    <div class="hud" v-if="!loading">
      <div class="parcel-id">
        <div class="bitmap-address">
          {{ txIndex }}:{{ byteIndex }}.{{ blockHeight }}.bitmap
        </div>
      </div>
    </div>
  </main>
</template>
<script>
import { useCryptoJouleStore } from "@/stores/CryptoJouleStore";
import CryptoJouleExplorer from "@/CryptoJouleExplorer.js";
import { gsap } from "gsap";

export default {
  name: "CryptoJouleExplorer",
  props: {
    blockHeight: {
      type: String,
      required: true,
    },
    txIndex: {
      type: String,
      required: true,
    },
    byteIndex: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const cjStore = useCryptoJouleStore();
    
    return {
      cjStore,
    };
  },
  data() {
    return {
      loading: true,
    };
  },
  async mounted() {
    if(!this.cjStore.initialized) {
      await this.cjStore.initializeStore(this.blockHeight);
    }
    // verify that the bitmap's parcel contains a crypto-joule at the 
    // specified block height, transaction index, and byte index
    if(!(await this.cjStore.verifyCryptoJoule(this.blockHeight, this.txIndex, this.byteIndex))) {
      this.$router.push({ name: "visualizer" });
    }

    // in cjStore, get the crypto-joule at the specified parcel and index
    // cjStore.cryptoJoules is an array, containing object(s) with an array titled
    // cryptoJoules with object(s) that have the properties index and parcel
    // properties, which are both numbers 
    const joule = this.cjStore.getCryptoJoule(parseInt(this.txIndex), parseInt(this.byteIndex));

    console.log("Located Joule is: ", joule);

    const explorer = new CryptoJouleExplorer('#explorer');
    
    setTimeout(() => {
      gsap.to('#explorer', { opacity: 1, duration: 1 });
      this.loading = false;
    }, 3000);
  },
  methods: {},
};
</script>
<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1.5;
  height: 100%;
  max-height: 100vh;
  width: 100%;
  font-size: 2rem;
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
}
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  line-height: 1.5;
  height: 100%;
  max-height: 100vh;
  width: 100%;
  font-size: 2rem;
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
  color: var(--color-primary);
  z-index: 1000;

  img {
    display: block;
    margin: 0 auto;
  }

  span {
    color: #ff6600;
    display: block;
  }

}
.hud {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Major Mono Display', monospace;
  line-height: 1.5;  
  font-size: 2rem;
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
  color: var(--color-primary);
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
}

#explorer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  z-index: 0;
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
  opacity: 0;
}
</style>
