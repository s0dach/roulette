<template>
  <div>
    <div v-if="tech.status">
      <div class="tech">{{ tech.message }}</div>
    </div>
    <div class="index-layout" v-else-if="game">
    <!-- Мобильные блоки -->
    <div class="grid" v-if="$resize && $mq.below(1024)">
      <div class="grid__column">
        <Chart class="chart--mobile" :game.sync="game" :graph.sync="graph" :is-mobile="true"/>
        <Multiplier :history.sync="history"/>
        <AddItemMobile :game.sync="game" :bet.sync="bet" :user-inventory.sync="userInventory"/>
        <BetsMobile :game.sync="game" :bets.sync="bets"/>
      </div>

      <modal v-if="$resize && $mq.below(1024)" name="inventory-modal" width="280" height="auto">
        <Inventory
            :user-inventory.sync="userInventory"
            :is-mobile="true"
        />
      </modal>
    </div>
    <!-- Конец -->

    <!-- Десктопные блоки -->
    <div v-else class="grid">
      <div class="grid__column grid__column--25">
        <Chart :game.sync="game" :graph.sync="graph"/>
        <Multiplier :history.sync="history"/>
        <Inventory :user-inventory.sync="userInventory"/>
      </div>

      <div class="grid__column grid__column--50">
        <Game :game.sync="game" :bet.sync="bet" :user-inventory.sync="userInventory"/>
        <Bets :game.sync="game" :bets.sync="bets"/>
      </div>

      <div class="grid__column grid__column--25 grid__column--side-right">
        <Chatbox :online="online"/>
      </div>
    </div>
    <!-- Конец -->
  </div>
  </div>
</template>

<script lang="js">
import Chart from '@/components/Chart/Chart.vue';
import Inventory from '@/components/Inventory/Inventory.vue';
import Chatbox from '@/components/Chatbox/Chatbox.vue';
import Game from '@/components/Game/Game.vue';
import Bets from '@/components/Bets/Bets.vue';
import Multiplier from "@/components/Multiplier/Multiplier.vue";
import AddItemMobile from "@/components/Add-item-mobile/Add-item-mobile.vue";
import BetsMobile from "@/components/BetsMobile/BetsMobile.vue";

export default {
  name: 'Home',
  components: {
    Multiplier,
    Chart,
    Inventory,
    Chatbox,
    Game,
    Bets,
    AddItemMobile,
    BetsMobile
  },
  props: ['userInventory', 'online'],
  data() {
    return {
      bet: null,
      game: null,
      graph: {
        a: 0,
        b: 0,
        c: 0,
        c_m: 0,
        circle: 0,
        circle_m: 0,
        multipliers: [4.00, 3.00, 2.00, 1.00]
      },
      bets: {},
      history: [],
      betChecked: false,
      MULTIPLIER_TIMER: null,
      TIME_TIMER: null,
      tech: {
        status: false,
        message: ''
      }
    }
  },
  watch: {
    'bets'() {
      this.searchMyBet()
    },
    '$root.user'() {
      this.searchMyBet()
    }
  },
  mounted() {
    this.getGame();
    this.getHistory();
  },
  beforeDestroy() {
    if (this.MULTIPLIER_TIMER !== null) {
      clearInterval(this.MULTIPLIER_TIMER)
      this.MULTIPLIER_TIMER = null
    }

    if (this.TIME_TIMER !== null) {
      clearInterval(this.TIME_TIMER)
      this.TIME_TIMER = null
    }
  },
  methods: {
    getGame() {
      this.$root.request('GET', '/crash')
          .then(data => {
            this.game = data.game
            this.graph = data.graph
            this.bets = data.bets

            this.bets.sort((a, b) => {
              if (b.sum < a.sum) return -1;
            });

            this.bets.sort(((e) => {
              if (this.$root.user !== null) {
                if (e.user.steamid === this.$root.user.steamid) {
                  return -1;
                } else {
                  return 0;
                }
              } else {
                return 0;
              }
            }));

            if (this.game.status === 'timer') {
              document.title = `Новый раунд → RAFT.GG`

              if (this.TIME_TIMER === null) {
                this.startTimer()
              }
            }

            if (this.game.status === 'crash') {
              if (this.MULTIPLIER_TIMER === null) {
                this.startMultiplierTimer()
              }
            }
          })
          .catch((err) => {
            this.tech = {
              status: true,
              message: err
            }
          });
    },
    addItem(id) {
      const inv = this.userInventory.items[id];

      if (typeof this.userInventory.selected.items[inv.id] !== "undefined") {
        delete this.userInventory.selected.items[inv.id];
        this.userInventory.selected.price = parseFloat((this.userInventory.selected.price - inv.item.price).toFixed(2));
      } else {
        this.userInventory.selected.items[inv.id] = inv;
        this.userInventory.selected.price = parseFloat((this.userInventory.selected.price + inv.item.price).toFixed(2));
      }

      this.$forceUpdate();
    },
    getHistory() {
      this.$root.request('GET', '/crash/history')
          .then(history => {
            this.history = history
          })
          .catch(() => {

          });
    },
    searchMyBet() {
      try {
        if (this.$root.user !== null) {
          const betIndex = this.bets.findIndex(x => x.user.id === this.$root.user.id)

          if (betIndex > -1) {
            this.bet = this.bets[betIndex]

            if (this.bets[betIndex].status === 1) {
              this.betChecked = true
            }
          } else {
            this.bet = null
          }
        } else {
          this.bet = null
        }
      } catch (e) {
        this.bet = null
      }
    },
    startTimer() {
      this.TIME_TIMER = setInterval(async () => {
        if (this.game.time.toFixed(2) === '0.00') {
          clearInterval(this.TIME_TIMER)
          this.TIME_TIMER = null

          return
        }

        this.game.time -= 0.1
      }, 100)
    },
    startMultiplierTimer() {
      let now_old = -1

      this.MULTIPLIER_TIMER = setInterval(async () => {
        this.game.i += 1
        this.game.now = parseFloat(String(Math.pow(Math.E, 0.00006 * this.game.i * 1000 / 20)))

        if (now_old.toFixed(2) !== this.game.now.toFixed(2)) {
          now_old = this.game.now

          this.game.multiplier = this.game.now
          this.generateGraph()

          document.title = `x${this.game.multiplier.toFixed(2)} → RAFT.GG`
        }
      }, 50)
    },
    generateGraph() {
      if (this.graph.circle < 143.281) {
        if (this.game.now > 3) {
          this.graph.circle += 0.53067037
        } else {
          this.graph.circle += 0.477603333
        }
      }

      if (this.graph.a < 55.016) {
        if (this.game.now > 3) {
          this.graph.a += 0.2037629625 // 13500
        } else {
          this.graph.a += 0.1833866665 // 15000
        }
      }

      if (this.graph.b < 128.370666667) {
        if (this.game.now > 3) {
          this.graph.b += 0.4754469135
        } else {
          this.graph.b += 0.427902222
        }
      }

      if (this.graph.c < 143) {
        if (this.game.now > 3) {
          this.graph.c += 0.5296296295
        } else {
          this.graph.c += 0.4766666665
        }
      }

      if (this.graph.c_m < 156.476666621) {
        if (this.game.now > 3) {
          this.graph.c_m += 0.5588452375 // 14000
        } else {
          this.graph.c_m += 0.4766666665
        }
      }

      if (this.graph.circle_m < 143.281) {
        if (this.game.now > 3) {
          this.graph.circle_m += 0.511717857 // 14000
        } else {
          this.graph.circle_m += 0.447753125 // 16000
        }
      }

      if (this.game.now > this.graph.multipliers[0]) {
        this.graph.multipliers.pop()
        this.graph.multipliers.unshift(parseFloat(this.game.now.toFixed(0)) + 2)
      }
    }
  },
  sockets: {
    crashStartTimer(data) {
      if (this.game !== null) {
        if (this.TIME_TIMER !== null) {
          clearInterval(this.TIME_TIMER)
          this.TIME_TIMER = null
        }

        if (this.MULTIPLIER_TIMER !== null) {
          clearInterval(this.MULTIPLIER_TIMER)
          this.MULTIPLIER_TIMER = null
        }

        this.betChecked = false
        this.game.status = 'timer'
        this.game.multiplier = 1.00
        this.game.time = 9.00
        this.game.skins = 0
        this.game.members = 0
        this.game.i = 0
        this.game.now = 1.00
        this.graph = data.graph
        this.bets = {}

        this.startTimer()

        document.title = `Новый раунд → RAFT.GG`
      }
    },
    crashStart() {
      if (this.game !== null) {
        this.game.status = 'crash'
        this.game.i = 0
        this.game.now = 1.00
        this.game.multiplier = 1.00

        if (this.TIME_TIMER !== null) {
          clearInterval(this.TIME_TIMER)
        }

        if (this.MULTIPLIER_TIMER !== null) {
          clearInterval(this.MULTIPLIER_TIMER)
        }

        this.startMultiplierTimer()
      }
    },
    crashEnd(data) {
      if (this.game !== null) {
        if (this.MULTIPLIER_TIMER !== null) {
          clearInterval(this.MULTIPLIER_TIMER)
          this.MULTIPLIER_TIMER = null
        }

        if (this.TIME_TIMER !== null) {
          clearInterval(this.TIME_TIMER)
          this.TIME_TIMER = null
        }

        this.game.i = 0
        this.game.now = 1.00
        this.game.status = 'crashed'
        this.game.multiplier = data.multiplier

        document.title = `Краш! → RAFT.GG`

        this.history.unshift({
          id: this.game.id,
          multiplier: this.game.multiplier
        })
      }
    },
    crashUpdateBets(data) {
      if (this.game !== null) {
        this.bets = data.bets
        this.game.skins = data.skins
        this.game.members = data.members

        this.bets.sort((a, b) => {
          if (b.sum < a.sum) return -1;
        });

        this.bets.sort(((e) => {
          if (this.$root.user !== null) {
            if (e.user.steamid === this.$root.user.steamid) {
              return -1;
            } else {
              return 0;
            }
          } else {
            return 0;
          }
        }));
      }
    },
    crashUpdateBet(data) {
      if (this.$root.user !== null && data.bet.user.id === this.$root.user.id) {
        if (!this.betChecked && data.bet.status === 1) {
          this.betChecked = true

          this.$root.showNotify('success', `Вы выиграли ${data.bet.win.toFixed(2)}$`);

          this.$root.$emit('updateInventory');

          this.$root.getUser();

          setTimeout(() => {
            for (const id in this.userInventory.items) {
              if (this.userInventory.items[id].item.market_hash_name === data.bet.winItem.market_hash_name) {
                this.addItem(id);
                return;
              }
            }
          }, 500);
        }
      }
    }
  }
}
</script>