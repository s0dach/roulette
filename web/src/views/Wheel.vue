<template>
  <div>
    <div v-if="tech.status">
      <div class="tech">{{ tech.message }}</div>
    </div>
    <div class="index-layout" v-if="game">
      <div v-if="$resize && $mq.below(1024)">
        <div class="grid__column grid__column--25 wheel__mobile">
          <div class="wrapper-in wheelwrap topwhell flex-b">
            <div class="wrapperroll">
              <div class="center-circle">
                <div class="circle-arrow">
                  <div class="timer-circle">
                    <div class="timer">{{ game.time.toFixed(2) }} c.</div>
                  </div>
                </div>
              </div>
              <div class="wheel_new" style="transform: rotate(0deg);">
                <div class="wheel_new_image"></div>
              </div>
            </div>
            <div class="roll-right flex">
              <div class="last-games-info">
                <div class="gwrp" v-for="his in history">
                  <div class="lgg" v-if="his === 'black'">
                  </div>
                  <div class="lgr" v-if="his === 'red'">
                  </div>
                  <div class="lgb" v-if="his === 'blue'">
                  </div>
                  <div class="lggr" v-if="his === 'green'">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="add-item-mobile">
          <div class="add-item-mobile__add" @click="$modal.show('inventory-modal')">
            <span class="add-item-mobile__add-plus">+</span>
            <span class="add-item-mobile__add-text">Добавить предмет</span>
          </div>
        </div>

        <div class="grid__column grid__column--50 wheel__mobile roll-bets">
          <div class="wheel-box__mobile grey" :class="[game.status === 1 ? 'noactivetable' : '']">
            <h2>
              <a style="cursor: pointer;" @click="placeBet('black')">2x</a>
            </h2>
            <div class="wl-table">
              <div class="wl-row flex-b">
                <span>
                  <i class="fa fa-user-o"></i>
                </span>
                <span>{{ bets['black'].users }}</span>
                <span>{{ bets['black'].price.toFixed(2) }} $</span>
              </div>
            </div>
            <div class="wl-row flex-b" v-for="bet in bets['black'].bets">
              <span>
                <img width="25" height="25" :src="bet.user.avatar" alt="">
              </span>
              <span>{{ bet.user.username }}</span>
              <span>{{ bet.sum.toFixed(2) }} $</span>
            </div>
          </div>
          <div class="wheel-box__mobile red" :class="[game.status === 1 ? 'noactivetable' : '']">
            <h2>
              <a style="cursor: pointer;" @click="placeBet('red')">3x</a>
            </h2>
            <div class="wl-table">
              <div class="wl-row flex-b">
                <span><i class="fa fa-user-o"></i></span>
                <span>{{ bets['red'].users }}</span>
                <span>{{ bets['red'].price.toFixed(2) }} $</span>
              </div>
            </div>
            <div class="wl-row flex-b" v-for="bet in bets['red'].bets">
              <span>
                <img width="25" height="25" :src="bet.user.avatar" alt="">
              </span>
              <span>{{ bet.user.username }}</span>
              <span>{{ bet.sum.toFixed(2) }} $</span>
            </div>
          </div>
          <div class="wheel-box__mobile blue" :class="[game.status === 1 ? 'noactivetable' : '']">
            <h2>
              <a style="cursor: pointer;" @click="placeBet('blue')">5x</a>
            </h2>
            <div class="wl-table">
              <div class="wl-row flex-b">
                <span><i class="fa fa-user-o"></i></span>
                <span>{{ bets['blue'].users }}</span>
                <span>{{ bets['blue'].price.toFixed(2) }} $</span>
              </div>
            </div>
            <div class="wl-row flex-b" v-for="bet in bets['blue'].bets">
              <span>
                <img width="25" height="25" :src="bet.user.avatar" alt="">
              </span>
              <span>{{ bet.user.username }}</span>
              <span>{{ bet.sum.toFixed(2) }} $</span>
            </div>
          </div>
          <div class="wheel-box__mobile green" :class="[game.status === 1 ? 'noactivetable' : '']">
            <h2>
              <a style="cursor: pointer;" @click="placeBet('green')">50x</a>
            </h2>
            <div class="wl-table">
              <div class="wl-row flex-b">
                <span><i class="fa fa-user-o"></i></span>
                <span>{{ bets['green'].users }}</span>
                <span>{{ bets['green'].price.toFixed(2) }} $</span>
              </div>
            </div>
            <div class="wl-row flex-b" v-for="bet in bets['green'].bets">
              <span>
                <img width="25" height="25" :src="bet.user.avatar" alt="">
              </span>
              <span>{{ bet.user.username }}</span>
              <span>{{ bet.sum.toFixed(2) }} $</span>
            </div>
          </div>
        </div>

        <modal v-if="$resize && $mq.below(1024)" name="inventory-modal" width="280" height="auto">
          <Inventory
              :user-inventory.sync="userInventory"
              :is-mobile="true"
          />
        </modal>
      </div>

      <div class="grid" v-else>
        <div class="grid__column grid__column--25">
          <div class="wrapper-in wheelwrap topwhell flex-b">
            <div class="wrapperroll">
              <div class="center-circle">
                <div class="circle-arrow">
                  <div class="timer-circle">
                    <div class="timer">{{ game.time.toFixed(2) }} c.</div>
                  </div>
                </div>
              </div>
              <div class="wheel_new" style="transform: rotate(0deg);">
                <div class="wheel_new_image"></div>
              </div>
            </div>
            <div class="roll-right flex">
              <div class="last-games-info">
                <div class="gwrp" v-for="his in history">
                  <div class="lgg" v-if="his === 'black'">
                  </div>
                  <div class="lgr" v-if="his === 'red'">
                  </div>
                  <div class="lgb" v-if="his === 'blue'">
                  </div>
                  <div class="lggr" v-if="his === 'green'">
                  </div>
                </div>
              </div>
            </div>

          </div>
          <Inventory :user-inventory.sync="userInventory"/>
        </div>

        <div class="grid__column grid__column--50 roll-bets">
          <div class="wheel-box grey" :class="[game.status === 1 ? 'noactivetable' : '']">
            <h2>
              <a style="cursor: pointer;" @click="placeBet('black')">2x</a>
            </h2>
            <div class="wl-table">
              <div class="wl-row flex-b">
                <span>
                  <i class="fa fa-user-o"></i>
                </span>
                <span>{{ bets['black'].users }}</span>
                <span>{{ bets['black'].price.toFixed(2) }} $</span>
              </div>
            </div>
            <div class="wl-row flex-b" v-for="bet in bets['black'].bets">
              <span>
                <img width="25" height="25" :src="bet.user.avatar" alt="">
              </span>
              <span>{{ bet.user.username }}</span>
              <span>{{ bet.sum.toFixed(2) }} $</span>
            </div>
          </div>
          <div class="wheel-box red" :class="[game.status === 1 ? 'noactivetable' : '']">
            <h2>
              <a style="cursor: pointer;" @click="placeBet('red')">3x</a>
            </h2>
            <div class="wl-table">
              <div class="wl-row flex-b">
                <span><i class="fa fa-user-o"></i></span>
                <span>{{ bets['red'].users }}</span>
                <span>{{ bets['red'].price.toFixed(2) }} $</span>
              </div>
            </div>
            <div class="wl-row flex-b" v-for="bet in bets['red'].bets">
              <span>
                <img width="25" height="25" :src="bet.user.avatar" alt="">
              </span>
              <span>{{ bet.user.username }}</span>
              <span>{{ bet.sum.toFixed(2) }} $</span>
            </div>
          </div>
          <div class="wheel-box blue" :class="[game.status === 1 ? 'noactivetable' : '']">
            <h2>
              <a style="cursor: pointer;" @click="placeBet('blue')">5x</a>
            </h2>
            <div class="wl-table">
              <div class="wl-row flex-b">
                <span><i class="fa fa-user-o"></i></span>
                <span>{{ bets['blue'].users }}</span>
                <span>{{ bets['blue'].price.toFixed(2) }} $</span>
              </div>
            </div>
            <div class="wl-row flex-b" v-for="bet in bets['blue'].bets">
              <span>
                <img width="25" height="25" :src="bet.user.avatar" alt="">
              </span>
              <span>{{ bet.user.username }}</span>
              <span>{{ bet.sum.toFixed(2) }} $</span>
            </div>
          </div>
          <div class="wheel-box green" :class="[game.status === 1 ? 'noactivetable' : '']">
            <h2>
              <a style="cursor: pointer;" @click="placeBet('green')">50x</a>
            </h2>
            <div class="wl-table">
              <div class="wl-row flex-b">
                <span><i class="fa fa-user-o"></i></span>
                <span>{{ bets['green'].users }}</span>
                <span>{{ bets['green'].price.toFixed(2) }} $</span>
              </div>
            </div>
            <div class="wl-row flex-b" v-for="bet in bets['green'].bets">
              <span>
                <img width="25" height="25" :src="bet.user.avatar" alt="">
              </span>
              <span>{{ bet.user.username }}</span>
              <span>{{ bet.sum.toFixed(2) }} $</span>
            </div>
          </div>
        </div>

        <div class="grid__column grid__column--25 grid__column--side-right">
          <Chatbox :online="online"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chatbox from "@/components/Chatbox/Chatbox";
import Inventory from "@/components/Inventory/Inventory";
import $ from 'jquery'

export default {
  components: {
    Chatbox,
    Inventory
  },
  props: ['userInventory', 'online'],
  data() {
    return {
      TIMER_TO_START: null,
      game: null,
      history: {},
      bets: {
        black: {
          users: 0,
          price: 0,
          bets: []
        },
        red: {
          users: 0,
          price: 0,
          bets: []
        },
        blue: {
          users: 0,
          price: 0,
          bets: []
        },
        green: {
          users: 0,
          price: 0,
          bets: []
        }
      },
      tech: {
        status: false,
        message: ''
      }
    }
  },
  mounted() {
    this.getWheel()
  },
  beforeDestroy() {
    if (this.TIMER_TO_START !== null) {
      clearInterval(this.TIMER_TO_START)
      this.TIMER_TO_START = null
    }
  },
  methods: {
    getWheel() {
      this.$root.request('GET', '/wheel')
        .then((data) => {
          this.game = data.game
          this.history = data.history
          this.bets = data.bets

          if (this.game.status === 0) {
            this.startTimer()
          }

          setTimeout(() => {
            $('.wheel_new').css({
              transition: '-webkit-transform 0ms cubic-bezier(0.32, 0.64, 0.45, 1)',
              transform: 'rotate(' + this.game.lastRotate + 'deg)'
            });

            if (this.game.status === 1) {
              this.startRoll()
            }
          }, 100)
        })
        .catch((err) => {
          this.tech = {
            status: true,
            message: err
          }
        });
    },
    placeBet(color) {
      this.$root.request('POST', '/wheel/setBet', {
        ids: Object.values(this.userInventory.selected.items).map((item) => {
          return item.id
        }),
        color
      }).then(() => {
        this.$root.$emit('updateInventory');

        this.userInventory.selected = {
          items: {},
          price: 0.00
        };

        this.$root.showNotify('success', 'Ставка поставлена');
      }).catch(err => {
        this.$root.showNotify('error', err);
      });
    },
    startTimer() {
      this.TIMER_TO_START = setInterval(() => {
        if (this.game.time <= 0) {
          clearInterval(this.TIMER_TO_START)
          this.TIMER_TO_START = null

          this.game.time = 0.00

          return
        }

        if ((this.game.time - 0.1).toFixed(2) === '-0.00') {
          this.game.time = 0.00
        } else {
          this.game.time -= 0.1
        }
      }, 100)
    },
    startRoll() {
      $('.wheel_new').css({
        transition: '-webkit-transform ' + this.game.ms * 1000 + 'ms cubic-bezier(0.32, 0.64, 0.45, 1)',
        transform: 'rotate(' + this.game.rotate + 'deg)'
      });
    }
  },
  sockets: {
    wheelStartTimer() {
      this.game.time = 25

      this.startTimer()
    },
    wheelStartRoll(data) {
      this.game.ms = data.ms
      this.game.rotate = data.rotate
      this.game.status = 1

      this.startRoll()
    },
    wheelNewGame(data) {
      if (this.TIMER_TO_START !== null) {
        clearInterval(this.TIMER_TO_START)
      }

      this.game.status = 0

      $('.wheel_new').css({
        transition: '-webkit-transform 0ms cubic-bezier(0.32, 0.64, 0.45, 1)',
        transform: 'rotate(' + data.rotate + 'deg)'
      });

      this.history = data.history
      this.bets = {
        black: {
          users: 0,
          price: 0,
          bets: []
        },
        red: {
          users: 0,
          price: 0,
          bets: []
        },
        blue: {
          users: 0,
          price: 0,
          bets: []
        },
        green: {
          users: 0,
          price: 0,
          bets: []
        }
      }

      if (this.$root.user !== null) {
        this.$root.getUser()
        this.$root.$emit('updateInventory')
      }
    },
    wheelNewBets(bets) {
      this.bets = bets
    }
  }
}
</script>

<style>
.roll-bets {
  display: contents;
}

.wrapper-in.wheelwrap.topwhell {
  position: relative;
}

.wheel__mobile {
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
}

.add-item-mobile__add-plus {
  padding-top: 0px;
}

.add-item-mobile__add-text {
  padding-bottom: 20px;
}

.wheelwrap {
  margin-bottom: 20px;
}

.wheelwrap.flex-b > :first-child {
  margin: 0px 10px 0px 0px;
}

.btl-stat-table, .battle-num-info, .battle-beat, .classic-beat-info, .game-sideblocks, .history-wrapper, .roll-left, .last-games-info, .tabs {
  position: relative;
  z-index: 3;
}

.roll-left {
  display: flex;
  align-items: center;
  justify-content: center;
}

.roll-left, .roll-right {
  width: 30%;
}

.game-title {
  font-size: 14px;
  margin-bottom: 15px;
}

.roll-left h3 {
  font-size: 16px;
}

.game-title h3 {
  font-size: 18px;
  font-weight: normal;
  color: #fff;
  margin: 0px 0px 10px 0px;
}

.opt-quontity.opt-bet {
  width: 210px;
}

.opt-bet {
  position: relative;
}

.opt-quontity.opt-bet label {
  margin: 0px 0px 10px 0px;
  display: block;
}

.opt-quontity.opt-bet input {
  background: #28305f;
  border: 1px solid #41467c;
  border-radius: 3px;
  height: 34px;
  line-height: 34px;
  padding: 0px 10px 0px 10px;
  font-size: 13px;
  color: #fff;
  margin: 0px 0px 10px 0px;
}

.opt-bet input {
  border-radius: 1px;
  padding: 8px 15px 8px 15px;
  width: 210px;
  box-sizing: border-box;
}

.opt-bet .opt-dub {
  position: absolute;
  right: 10px;
  color: #959fb1;
  font-size: 12px;
  bottom: 20px;
}

.betbtns-cost {
  list-style: none;
  padding: 0px 0px 0px 0px;
  flex-wrap: wrap;
}

.flex-c {
  display: flex;
  justify-content: center;
}

.betbtns-cost a {
  border: 1px solid #30365d;
  color: #969dcd;
  display: block;
  text-decoration: none;
  padding: 5px 10px 5px 10px;
  border-radius: 3px;
  margin: 0px 3px 6px 3px;
}

.wrapperroll {
  max-width: 369px;
}

.center-circle {
  position: absolute;
  background: #181f4b;
  left: 8px;
  right: 8px;
  top: 8px;
  bottom: 8px;
  border-radius: 50%;
}

.circle-arrow {
  position: absolute;
  left: 20px;
  right: 20px;
  top: 20px;
  bottom: 20px;
  border-radius: 50%;
  border: 2px solid #30365d;
}

.timer-circle {
  background: radial-gradient(#303971, #1e2550);
  position: absolute;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.circle-arrow:after {
  content: "\27A4";
  display: block;
  bottom: -13px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0%) rotate(90deg);
  font-size: 26px;
  color: inherit;
}

.timer {
  font-size: 30px;
  color: #fff;
}

.wheel_new {
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  overflow: hidden;
}

.wheel_new_image {
  width: 100%;
  height: 100%;
  background: url(../assets/images/wheel_rot.svg) no-repeat 50%;
  background-size: cover;
  transform: rotate(187deg);
}

.roll-right {
  justify-content: flex-end;
  align-items: center;
}

.roll-left, .roll-right {
  width: 30%;
}

.btl-stat-table, .battle-num-info, .battle-beat, .classic-beat-info, .game-sideblocks, .history-wrapper, .roll-left, .last-games-info, .tabs {
  position: relative;
  z-index: 3;
}

.last-games-info {
  width: 30px;
  margin: 0px 50px 0px 0px;
  padding: 0px 50px 0px 0px;
  position: relative;
}

.gwrp {
  padding: 4px;
  display: table-cell;
}

.lgg {
  height: 3px;
  width: 18px;
  background: #30365d;
  position: relative;
  left: 0px;
}

.lgr {
  height: 3px;
  width: 22px;
  background: #da3e58;
  position: relative;
  left: 1px;
}

.lgb {
  height: 3px;
  width: 24px;
  background: #0a55f7;
  position: relative;
  left: 0px;
}

.lggr {
  height: 3px;
  width: 26px;
  background: #35c076;
  position: relative;
  left: 0px;
}

.lgr .ttg {
  right: 41px;
}

.ttg {
  pointer-events: initial;
}

.ttg {
  pointer-events: none;
}

.ttg {
  background: #0e1331;
  position: absolute;
  top: -20px;
  width: 125px;
  word-break: break-all;
  padding: 20px;
  border-radius: 4px;
  opacity: 0;
  transition: 0.5s;
  z-index: -10;
}

.ttg:before {
  content: "";
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-left: 8px solid #0e1331;
  border-bottom: 8px solid transparent;
  position: absolute;
  display: block;
  top: 13px;
  right: -8px;
}

.ttg span {
  display: block;
}

.ttg span h5 {
  color: #0a55f7;
  font-size: 11px;
  font-weight: 100;
  font-family: 'OpenSans-Light';
  margin: 0px 0px 5px 0px;
}

.ttg span p {
  margin: 0px 0px 0px 0px;
  padding: 0px 0px 10px 0px;
  font-size: 11px;
  color: #fff;
}

.wheelwrap.flex-b > :last-child {
  margin: 0px 0px 0px 3px;
}

.hash-block {
  width: calc(100% - 60px);
  position: absolute;
  bottom: 40px;
  text-align: center;
}

.hash-block span {
  color: #fff;
}

.wrapperroll {
  width: 100%;
  max-width: 370px;
  margin: 0px 30px 0px 55px;
}

.wrapperroll {
  position: relative;
  height: 370px;
}

.wheelwrap.flex-b > :first-child {
  margin: 0px 10px 0px 0px;
}

.noactivetable {
  opacity: 0.3;
  position: relative;
}

.wheel-box {
  width: 100%;
  margin: 0px 10px 0px 10px;
}

.wheel-box__mobile {
  margin: 0px 10px 0px 10px;
}

.grey h2 {
  color: #616686;
  background: #232955;
  margin: 0px 0px 15px 0px;
  text-align: center;
}

.grey h2 a {
  color: #616686;
  text-decoration: none;
  display: block;
  padding: 10px 0px 10px 0px;
  position: relative;
  display: flex;
  justify-content: center;
}

.grey h2 a:before {
  content: "";
  display: block;
  width: 0%;
  background: rgba(93, 101, 160, 0.3);
  height: 100%;
  position: absolute;
  top: 0px;
  transition: 0.5s;
}

.wl-table > :nth-child(2) {
  font-size: 20px;
}

.wl-table .wl-row:nth-child(1) span {
  border-bottom: none;
}

.grey .wl-row span {
  border-bottom: 1px solid #232955;
  width: 100%;
  padding: 7px 10px 7px 0px;
  color: #616686;
}

.grey h2 a {
  color: #616686;
  text-decoration: none;
  display: block;
  padding: 10px 0px 10px 0px;
  position: relative;
  display: flex;
  justify-content: center;
}

.grey h2 a:before {
  content: "";
  display: block;
  width: 0%;
  background: rgba(93, 101, 160, 0.3);
  height: 100%;
  position: absolute;
  top: 0px;
  transition: 0.5s;
}

.grey h2 a:hover:before {
  content: "";
  display: block;
  width: 100%;
  background: rgba(93, 101, 160, 0.3);
  height: 100%;
  position: absolute;
  top: 0px;
  transition: 0.5s;
}

.red h2 a {
  color: #da3e58;
  text-decoration: none;
  display: block;
  padding: 10px 0px 10px 0px;
  position: relative;
  display: flex;
  justify-content: center;
}

.red h2 a:before {
  content: "";
  display: block;
  width: 0%;
  background: rgba(187, 57, 87, 0.3);
  height: 100%;
  position: absolute;
  top: 0px;
  transition: 0.5s;
}

.red h2 a:hover:before {
  content: "";
  display: block;
  width: 100%;
  background: rgba(187, 57, 87, 0.3);
  height: 100%;
  position: absolute;
  top: 0px;
  transition: 0.5s;
}

.blue h2 a {
  color: #0c50e8;
  text-decoration: none;
  display: block;
  padding: 10px 0px 10px 0px;
  position: relative;
  display: flex;
  justify-content: center;
}

.blue h2 a:before {
  content: "";
  display: block;
  width: 0%;
  background: rgba(34, 83, 234, 0.3);
  height: 100%;
  position: absolute;
  top: 0px;
  transition: 0.5s;
}

.blue h2 a:hover:before {
  content: "";
  display: block;
  width: 100%;
  background: rgba(34, 83, 234, 0.3);
  height: 100%;
  position: absolute;
  top: 0px;
  transition: 0.5s;
}

.green h2 a {
  color: #35c076;
  text-decoration: none;
  display: block;
  padding: 10px 0px 10px 0px;
  position: relative;
  display: flex;
  justify-content: center;
}

.green h2 a:before {
  content: "";
  display: block;
  width: 0%;
  background: rgba(23, 142, 124, 0.3);
  height: 100%;
  position: absolute;
  top: 0px;
  transition: 0.5s;
}

.green h2 a:hover:before {
  content: "";
  display: block;
  width: 100%;
  background: rgba(23, 142, 124, 0.3);
  height: 100%;
  position: absolute;
  top: 0px;
  transition: 0.5s;
}

.red .wl-row span {
  border-bottom: 1px solid #712c4d;
  width: 100%;
  padding: 7px 10px 7px 0px;
  color: #da3e58;
}

.blue .wl-row span {
  border-bottom: 1px solid #113aa1;
  width: 100%;
  padding: 7px 10px 7px 0px;
  color: #0c50e8;
}

.green .wl-row span {
  border-bottom: 1px solid #277061;
  width: 100%;
  padding: 7px 10px 7px 0px;
  color: #35c076;
}

.grey h2 {
  color: #616686;
  background: #232955;
  margin: 0px 0px 15px 0px;
  text-align: center;
}

.red h2 {
  color: #da3e58;
  background: #3f254e;
  margin: 0px 0px 15px 0px;
  text-align: center;
}

.blue h2 {
  color: #0c50e8;
  background: #152a6d;
  margin: 0px 0px 15px 0px;
  text-align: center;
}

.green h2 {
  color: #35c076;
  background: #1e3f54;
  margin: 0px 0px 15px 0px;
  text-align: center;
}

.wl-row > :nth-child(1), .wl-row > :nth-child(2) {
  width: auto !important;
}

.wl-row span {
  display: table-cell;
  align-items: center;
}

.wl-row > :nth-child(3) {
  text-align: right;
  padding: 5px 0px 5px 0px !important;
  justify-content: flex-end;
}

.noactivetable:before {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 10;
}
</style>