<template>
  <div class="crypto-joules">
    <h2>
      Discovered
      <span class="discovered">{{ cryptoJoules.length }} Crypto-Joules</span> in
      this Bitmap.
    </h2>
    <div class="crypto-joule-list">
      <div class="parcel" v-for="cj in cryptoJoules">
        <div class="parcel-id">
          <div class="bitmap-address">
            {{ cj.cryptoJoules[0].parcel }}.{{ blockInfo.height }}.bitmap
          </div>
          <div class="cj-txn">{{ abbreviateHash(cj.txn) }}</div>
        </div>
        <ol>
          <li class="crypto-joule" v-for="joule in cj.cryptoJoules">
            <div class="info">
              <div class="summary">
                <strong
                  >Discovered Crypto-Joule at Index {{ joule.index }}</strong
                >
              </div>
              <div class="tri-quanta">
                Tri-Quanta:
                <span
                  :style="{ color: '#' + joule.triQuanta.getTriQuanta() }"
                  >{{
                    cj.getParcelCryptoJouleForce(joule.index).triQuanta
                  }}</span
                >
                <div class="dominant">
                  Dominant:
                  <span class="force"
                    >{{
                      joule.triQuanta.getDominantForceName().toUpperCase()
                    }}
                    ({{
                      joule.triQuanta.getForces()[
                        joule.triQuanta.getDominantForceName()
                      ]
                    }})</span
                  >
                </div>
                <div class="subdominant">
                  Sub-Dominant:
                  <span class="force"
                    >{{
                      joule.triQuanta.getSubdominantForceName().toUpperCase()
                    }}
                    ({{
                      joule.triQuanta.getForces()[
                        joule.triQuanta.getSubdominantForceName()
                      ]
                    }})</span
                  >
                </div>
                <div class="tertiary">
                  Tertiary:
                  <span class="force"
                    >{{
                      joule.triQuanta.getTertiaryForceName().toUpperCase()
                    }}
                    ({{
                      joule.triQuanta.getForces()[
                        joule.triQuanta.getTertiaryForceName()
                      ]
                    }})</span
                  >
                </div>
              </div>
            </div>
            <div class="actions">
              <button class="view" @click.prevent="explore(joule)">
                Explore
              </button>
              <button class="mint" disabled="disabled">Mint</button>
              <button class="gift" disabled="disabled">Gift</button>
              <button class="sell" disabled="disabled">Sell</button>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
<script>
import { useRouter } from "vue-router";
export default {
  name: "CryptoJouleList",
  props: {
    blockHeight: {
      type: String,
      required: true,
    },
    blockInfo: {
      type: Object,
      required: true,
    },
    cryptoJoules: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {};
  },
  methods: {
    explore(joule) {
      this.router.push({
        name: "explore",
        params: {
          blockHeight: this.blockHeight,
          txIndex: joule.parcel,
          byteIndex: joule.index,
        },
      });
    },
    getForceValue(forceName) {
      return this.cryptoJoules.reduce((acc, cj) => {
        return acc + cj.forces.find((force) => force.name === forceName).value;
      }, 0);
    },
    getParcelAddress(txn) {
        return this.blockInfo.tx.indexOf(txn);
    },
    abbreviateHash(hash) {
      return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
    },
  },
};
</script>
<style scoped>
strong {
  color: var(--color-primary);
  font-weight: bold;
}
.crypto-joules {
  position: relative;
  z-index: 1000;
  padding: 1rem 0;

  h2 {
    font-size: 1em;
    text-align: center;
    width: 100%;
    margin: 0 auto;
    max-width: 720px;

    .discovered {
      color: var(--color-primary);
    }
  }

  .crypto-joule-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 1rem;
    width: 100%;
    font-size: 1rem;

    .parcel {
      display: flex;
      gap: 2rem;
      width: 100%;
      max-width: 720px;
      border-radius: 5px;
      margin: 0 auto;
      margin-bottom: 1rem;
      padding: 1rem;
    }

    .bitmap-address {
      color: #ff6600;
    }

    ol {
      width: 100%;
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    .crypto-joule {
      width: 100%;
      background-color: rgba(225, 225, 225, 0.33);
      border: 1px solid #202020;
      border-radius: 5px;
      margin-bottom: 1rem;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      gap: 1rem;

      .info {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        max-width: 720px;

        .summary {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .tri-quanta {
          .dominant,
          .subdominant,
          .tertiary {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
          }
        }
      }

      .actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 5px;
          background-color: var(--color-primary);
          color: #fff;
          cursor: pointer;

          &:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}
</style>
