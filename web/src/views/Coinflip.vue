<template>
  <div>
    <div v-if="tech.status">
      <div class="tech">{{ tech.message }}</div>
    </div>
    <div class="index-layout">
      <div class="grid">
        <div class="grid__column grid__column--25">
          <div class="select-sides widget">
            <div class="select-sides__block">
              <span>Выберите сторону:</span>
              <button class="button" :class="[activeSide === 'blue' ? 'selected' : '']" @click="activeSide = 'blue'">
                Синий
              </button>
              <button class="button" :class="[activeSide === 'green' ? 'selected' : '']" @click="activeSide = 'green'">
                Зеленый
              </button>
            </div>
            <div class="select-sides__block">
              <span>Выберите кол-во игр:</span>
              <button
                  class="button"
                  @click="newGameCount = 1"
                  :class="[newGameCount === 1 ? 'selected' : '']"
              >1
              </button>
              <button
                  class="button"
                  @click="newGameCount = 2"
                  :class="[newGameCount === 2 ? 'selected' : '']"
              >2
              </button>
              <button
                  class="button"
                  @click="newGameCount = 3"
                  :class="[newGameCount === 3 ? 'selected' : '']"
              >3
              </button>
              <button
                  class="button"
                  @click="newGameCount = 4"
                  :class="[newGameCount === 4 ? 'selected' : '']"
              >4
              </button>
              <button
                  class="button"
                  @click="newGameCount = 5"
                  :class="[newGameCount === 5 ? 'selected' : '']"
              >5
              </button>
            </div>
            <button
                class="button"
                :disabled="btnDisable"
                @click="createGame"
            >Создать игру
            </button>
          </div>

          <Inventory :user-inventory.sync="userInventory"/>
        </div>

        <div class="grid__column grid__column--50">
          <div class="runflip">
            <div class="runflip-form">
              <div class="runflip-header">
                <svg aria-hidden="true">
                  <use xlink:href="svg/svg.svg#transfer"></use>
                </svg>
                <div class="runflip-header__title">Активных игр: <span class="orange">{{ allActiveGames }}</span>
                </div>
                <div class="runflip-header__desc">Всего игр проведено: {{ allGames }}</div>
              </div>
              <div class="select-wrapper"><span class="select-wrapper__title">Показать игр:</span>
                <div class="select-dropdown ">
                  <select v-model="showGames">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="runflip-list">
              <div v-for="game in games.slice(0, showGames)" class="runflip-game">
                <template v-if="game.status <= 1">
                  <div class="runflip-game-sides">
                    <template v-if="game.blue_user === null">
                      <div class="runflip-game-side runflip-game-side--blue">
                        <div class="runflip-game-side__main">
                          <button type="button" class="btn btn--blue" @click="joinRoom(game.id)">Войти</button>
                        </div>
                        <div class="runflip-game-side__title">Присоединиться</div>
                        <div class="runflip-game-side__price">{{ game.min.toFixed(2) }} $</div>
                        <div class="runflip-game-side__icon"></div>
                      </div>
                    </template>
                    <template v-else>
                      <router-link tag="a" :to="{name: 'User', params: { id: game.blue_user.steamid }}"
                                   class="runflip-game-side runflip-game-side--blue"
                                   style="display: block;">
                        <div class="runflip-game-side__main runflip-game-side__main--has-hover">
                          <div class="runflip-game-photo ">
                            <img
                                :src="game.blue_user.avatar"
                                alt="">
                          </div>
                          <div class="runflip-game-drop">
                            <img
                                :src="'https://community.cloudflare.steamstatic.com/economy/image/' + game.blue_items[0].icon_url + '/360fx360f'"
                                alt="">
                          </div>
                        </div>
                        <div class="runflip-game-side__title">{{ game.blue_user.username }}</div>
                        <div class="runflip-game-side__price">{{ game.blue_sum.toFixed(2) }} $</div>
                        <div class="runflip-game-side__icon"></div>
                      </router-link>
                    </template>
                    <div class="runflip-game-info">
                      <div
                          v-if="game.status === 0"
                          class="runflip-game-status runflip-game-status--orange"
                      >Актив
                      </div>
                      <div class="runflip-game-vs" v-if="game.status === 0">vs</div>
                      <div
                          class="runflip-game-countdown"
                          style="transform: translateY(0rem); opacity: 1"
                          v-if="game.status === 1">{{ game.timeToStart }}
                      </div>
                    </div>
                    <template v-if="game.green_user === null">
                      <div class="runflip-game-side runflip-game-side--green">
                        <div class="runflip-game-side__main">
                          <button type="button" class="btn btn--blue" @click="joinRoom(game.id)">Войти</button>
                        </div>
                        <div class="runflip-game-side__title">Присоединиться</div>
                        <div class="runflip-game-side__price">{{ game.min.toFixed(2) }} $</div>
                        <div class="runflip-game-side__icon"></div>
                      </div>
                    </template>
                    <template v-else>
                      <router-link tag="a" :to="{name: 'User', params: { id: game.green_user.steamid }}"
                                   class="runflip-game-side runflip-game-side--green"
                                   style="display: block;">
                        <div class="runflip-game-side__main runflip-game-side__main--has-hover">
                          <div class="runflip-game-photo ">
                            <img
                                :src="game.green_user.avatar"
                                alt="">
                          </div>
                          <div class="runflip-game-drop">
                            <img
                                :src="'https://community.cloudflare.steamstatic.com/economy/image/' + game.green_items[0].icon_url + '/360fx360f'"
                                alt="">
                          </div>
                        </div>
                        <div class="runflip-game-side__title">{{ game.green_user.username }}</div>
                        <div class="runflip-game-side__price">{{ game.green_sum.toFixed(2) }} $</div>
                        <div class="runflip-game-side__icon"></div>
                      </router-link>
                    </template>
                  </div>
                </template>
                <template v-if="game.status >= 2 && game.status <= 3">
                  <div class="runflip-game-progress">
                    <div class="runflip-game-progress__item">
                      <div class="runflip-game-photo" style="transform: translateX(0rem); opacity: 1;"><img
                          :src="game.blue_user.avatar"
                          alt="">
                        <div v-if="$root.user !== null && $root.user.steamid === game.blue_user.steamid"
                             class="runflip-game-photo__label">Вы
                        </div>
                      </div>
                      <div class="runflip-game-progress__info">
                        <div class="runflip-game-progress__info-name"
                             style="transform: translateX(0rem); opacity: 1;"
                             v-if="game.status === 3">{{ game.blue_user.username }}
                        </div>
                        <div class="runflip-game-progress__info-price red"
                             style="transform: translateY(0rem); opacity: 1;"
                             v-if="game.status === 3 && game.win_side === 'green'">-{{
                            game.green_sum.toFixed(2)
                          }} $
                        </div>
                        <div class="runflip-game-progress__info-price"
                             style="transform: translateY(0rem); opacity: 1;"
                             v-if="game.status === 3 && game.win_side === 'blue'">+{{
                            game.win.toFixed(2)
                          }} $
                        </div>
                      </div>
                      <div class="runflip-progress runflip-progress--blue">
                        <div class="runflip-progress__line" style="width: 100%;">
                          <div class="runflip-progress__line-current"
                               :class="[game.win_side === 'green' ? 'runflip-progress__line-current__looser' : '']"
                               :id="'blue_' + game.id"
                               style="width: 0%;"><i
                              style="transform: translateX(0rem); opacity: 1;"
                              :style="[game.win_side === 'green' && game.status === 3 ? {'transform': 'rotate(90deg)'} : {}]"></i>
                          </div>
                          <div class="runflip-progress__line-graph"><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i></div>
                        </div>
                      </div>
                    </div>
                    <div class="runflip-game-progress__item">
                      <div class="runflip-game-photo" style="transform: translateX(0rem); opacity: 1;"><img
                          :src="game.green_user.avatar"
                          alt="">
                        <div v-if="$root.user !== null && $root.user.steamid === game.green_user.steamid"
                             class="runflip-game-photo__label">Вы
                        </div>
                      </div>
                      <div class="runflip-game-progress__info">
                        <div class="runflip-game-progress__info-name"
                             style="transform: translateX(0rem); opacity: 1;"
                             v-if="game.status === 3">{{
                            game.green_user.username
                          }}
                        </div>
                        <div class="runflip-game-progress__info-price red"
                             style="transform: translateY(0rem); opacity: 1;"
                             v-if="game.status === 3 && game.win_side === 'blue'">-{{
                            game.blue_sum.toFixed(2)
                          }} $
                        </div>
                        <div class="runflip-game-progress__info-price"
                             style="transform: translateY(0rem); opacity: 1;"
                             v-if="game.status === 3 && game.win_side === 'green'">+{{
                            game.win.toFixed(2)
                          }} $
                        </div>
                      </div>
                      <div class="runflip-progress runflip-progress--green">
                        <div class="runflip-progress__line" style="width: 100%;">
                          <div class="runflip-progress__line-current" :id="'green_' + game.id"
                               :class="[game.win_side === 'blue' ? 'runflip-progress__line-current__looser' : '']"
                               style="width: 0%;"><i
                              style="transform: translateX(0rem); opacity: 1;"
                              :style="[game.win_side === 'blue' && game.status === 3 ? {'transform': 'rotate(90deg)'} : {}]"></i>
                          </div>
                          <div class="runflip-progress__line-graph"><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i><i
                              style="transform: translateY(0rem); opacity: 1;"></i></div>
                        </div>
                      </div>
                    </div>
                    <div class="runflip-game-progress__footer">
                      <svg v-if="game.status === 3" aria-hidden="true"
                           style="transform: rotate(19.9844deg); opacity: 0.999221;">
                        <use
                            xlink:href="/svg/svg.svg#start"></use>
                      </svg>
                      <div class="runflip-game-progress__footer-title" v-if="game.status === 2">{{
                          game.rouletteTime
                        }}s
                      </div>
                      <div class="runflip-game-progress__footer-title" v-else-if="game.status === 3"
                           style="transform: translateY(0rem); opacity: 1;">Финиш
                      </div>
                      <form :id="`fairy_${game.id}`" v-if="game.status === 3" action="https://api.random.org/verify"
                            method="post" target="_blank">
                        <input type="hidden" name="format" value="json">
                        <input type="hidden" name="random" :value="JSON.stringify(JSON.parse(game.random).random)">
                        <input type="hidden" name="signature" :value="game.signature">
                      </form>
                      <a @click="openFair(game.id)" v-if="game.status === 3" class="runflip-game-progress__footer-desc">Честная
                        игра</a>
                      <svg v-if="game.status === 3" aria-hidden="true"
                           style="transform: rotate(-19.9844deg);opacity: 0.999221;">
                        <use
                            xlink:href="/svg/svg.svg#start-right"></use>
                      </svg>
                    </div>
                  </div>

                </template>
                <template v-if="game.status === 4">
                  <div class="runflip-game-sides">
                    <router-link tag="a" :to="{name: 'User', params: {id: game.blue_user.steamid}}"
                                 class="runflip-game-side runflip-game-side--blue"
                                 :class="[game.win_side === 'green' ? 'disabled' : '']"
                                 style="display: block;">
                      <div class="runflip-game-side__main runflip-game-side__main--has-hover">
                        <div class="runflip-game-photo "><img
                            :src="game.blue_user.avatar"
                            alt="">
                          <div v-if="$root.user !== null && $root.user.steamid === game.blue_user.steamid"
                               class="runflip-game-photo__label">Вы
                          </div>
                        </div>
                        <div class="runflip-game-drop"><img
                            :src="'https://community.cloudflare.steamstatic.com/economy/image/' + game.blue_items[0].icon_url + '/360fx360f'"
                            alt="">
                        </div>
                      </div>
                      <div class="runflip-game-side__title">{{ game.blue_user.username }}</div>
                      <div class="runflip-game-side__price">{{ game.blue_sum.toFixed(2) }}$</div>
                      <div class="runflip-game-side__icon"></div>
                    </router-link>
                    <div class="runflip-game-info">
                      <div class="runflip-game-status"
                           :class="[game.win_side === 'blue' ? 'runflip-game-status--blue' : 'runflip-game-status--green']">
                        Победа
                      </div>
                      <div class="runflip-game-winner"
                           :class="[game.win_side === 'blue' ? 'runflip-game-winner--blue' : 'runflip-game-winner--green']"></div>
                      <form :id="`fairy_${game.id}`" action="https://api.random.org/verify" method="post"
                            target="_blank">
                        <input type="hidden" name="format" value="json">
                        <input type="hidden" name="random" :value="JSON.stringify(JSON.parse(game.random).random)">
                        <input type="hidden" name="signature" :value="game.signature">
                      </form>
                      <a @click="openFair(game.id)" class="runflip-game-progress__footer-desc">Честная игра</a>
                    </div>
                    <router-link tag="a" class="runflip-game-side runflip-game-side--green"
                                 :class="[game.win_side === 'blue' ? 'disabled' : '']"
                                 :to="{name: 'User', params: {id: game.green_user.steamid}}"
                                 style="display: block;">
                      <div class="runflip-game-side__main runflip-game-side__main--has-hover">
                        <div class="runflip-game-photo "><img
                            :src="game.green_user.avatar"
                            alt="">
                          <div v-if="$root.user !== null && $root.user.steamid === game.green_user.steamid"
                               class="runflip-game-photo__label">Вы
                          </div>
                        </div>
                        <div class="runflip-game-drop"><img
                            :src="'https://community.cloudflare.steamstatic.com/economy/image/' + game.green_items[0].icon_url + '/360fx360f'"
                            alt="">
                        </div>
                      </div>
                      <div class="runflip-game-side__title">{{ game.green_user.username }}</div>
                      <div class="runflip-game-side__price">{{ game.green_sum.toFixed(2) }}$</div>
                      <div class="runflip-game-side__icon"></div>
                    </router-link>
                  </div>

                </template>
              </div>
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
  props: ['online', 'userInventory'],
  data() {
    return {
      tech: {
        status: false,
        message: ''
      },
      btnDisable: false,
      activeSide: 'blue',
      newGameCount: 1,
      games: {},
      allActiveGames: 0,
      allGames: 0,
      showGames: 10
    }
  },
  mounted() {
    this.getGames()
  },
  methods: {
    getGames() {
      this.$root.request('GET', '/coinflip/games')
          .then(data => {
            this.games = data.games
            this.allActiveGames = data.allActiveGames
            this.allGames = data.allGames

            this.games.map((game) => {
              if (game.status === 1) {
                this.startTimer(game)
              } else if (game.status === 2) {
                this.startGame(game)
              }
            })
          })
          .catch((err) => {
            this.tech = {
              status: true,
              message: err
            }
          });
    },
    startTimer(game) {
      try {
        const gameID = this.games.findIndex(x => x.id === game.id);

        if (typeof gameID === "undefined") {
          return;
        }

        if (typeof this.games[this.games.findIndex(x => x.id === game.id)].timerToStart !== 'undefined' &&
            this.games[this.games.findIndex(x => x.id === game.id)].timerToStart !== null) {
          return;
        }

        let timer = this.games[this.games.findIndex(x => x.id === game.id)].timeToStart;

        this.games[this.games.findIndex(x => x.id === game.id)].timerToStart = setInterval(() => {
          this.games[this.games.findIndex(x => x.id === game.id)].timeToStart = timer;

          if (timer === 0) {
            clearInterval(this.games[this.games.findIndex(x => x.id === game.id)].timerToStart);
            this.games[this.games.findIndex(x => x.id === game.id)].timerToStart = null
          }

          timer--;
          this.$forceUpdate();
        }, 1000);
      } catch (e) {
        console.log(e)
      }
    },
    startGame(game) {
      try {
        const gameID = this.games.findIndex(x => x.id === game.id);

        if (typeof gameID === "undefined") {
          return;
        }

        if (typeof this.games[this.games.findIndex(x => x.id === game.id)].timerFinish !== 'undefined' &&
            this.games[this.games.findIndex(x => x.id === game.id)].timerFinish !== null) {
          return;
        }

        let finishTime = this.games[this.games.findIndex(x => x.id === game.id)].rouletteTime;

        this.$forceUpdate();

        setTimeout(() => {
          this.games[this.games.findIndex(x => x.id === game.id)].timerFinish = setInterval(() => {
            this.games[this.games.findIndex(x => x.id === game.id)].rouletteTime = finishTime;

            if (parseFloat(finishTime) === 0) {
              clearInterval(this.games[this.games.findIndex(x => x.id === game.id)].timerFinish);
              this.games[this.games.findIndex(x => x.id === game.id)].timerFinish = null
            }

            finishTime = parseFloat(finishTime - 0.1).toFixed(1);
            this.$forceUpdate();
          }, 100);

          if (this.games[this.games.findIndex(x => x.id === game.id)].win_side === 'blue') {
            $(`#green_${this.games[this.games.findIndex(x => x.id === game.id)].id}`).animate({
              width: `${this.randomInteger(70, 90)}%`
            }, finishTime * 1000).css('overflow', 'inherit');
            $(`#blue_${this.games[this.games.findIndex(x => x.id === game.id)].id}`).animate({
              width: '100%'
            }, finishTime * 1000).css('overflow', 'inherit');
          } else {
            $(`#green_${this.games[this.games.findIndex(x => x.id === game.id)].id}`).animate({
              width: '100%'
            }, finishTime * 1000).css('overflow', 'inherit');
            $(`#blue_${this.games[this.games.findIndex(x => x.id === game.id)].id}`).animate({
              width: `${this.randomInteger(70, 90)}%`
            }, finishTime * 1000).css('overflow', 'inherit');
          }
        }, 100);
      } catch (e) {

      }
    },
    createGame() {
      this.btnDisable = true;

      this.$root.request('POST', '/coinflip/create', {
        side: this.activeSide,
        games: this.newGameCount,
        ids: Object.values(this.userInventory.selected.items).map((item) => {
          return item.id
        })
      }).then(() => {
        this.btnDisable = false;

        this.$root.$emit('updateInventory');

        this.userInventory.selected = {
          items: {},
          price: 0.00
        };

        return this.$root.showNotify('success', 'Игра создана');
      }).catch(e => {
        this.btnDisable = false;

        return this.$root.showNotify('error', e);
      })
    },
    joinRoom(gameId) {
      this.$root.request('POST', '/coinflip/join', {
        ids: Object.values(this.userInventory.selected.items).map((item) => {
          return item.id
        }),
        game_id: gameId
      }).then(() => {
        this.$root.$emit('updateInventory');

        this.userInventory.selected = {
          items: {},
          price: 0.00
        };

        this.$root.showNotify('success', 'Вы присоединились к игре!')
      }).catch((e) => {
        this.$root.showNotify('error', e)
      })
    },
    randomInteger(min, max) {
      let rand = min + Math.random() * (max + 1 - min);
      return Math.floor(rand);
    },
    openFair(id) {
      $(`#fairy_${id}`).submit()
    }
  },
  sockets: {
    coinflipGetGames(data) {
      this.games = data.games
      this.allActiveGames = data.allActiveGames
      this.allGames = data.allGames

      this.games.map((game) => {
        if (game.status === 1) {
          this.startTimer(game)
        } else if (game.status === 2) {
          this.startGame(game)
        }
      })
    },
    coinflipWinner(userId) {
      if (this.$root.user !== null && this.$root.user.id === userId) {
        this.$root.$emit('updateInventory');
        this.$root.getUser()
      }
    },
  }
}
</script>

<style>
.select-sides {
  padding: 15px;
}

.select-sides__block span {
  margin-right: 15px;
}

.select-sides__block button {
  margin-right: 9px;
  margin-bottom: 15px;
}

.select-sides__block .selected {
  background-color: #1b243c;
}

.runflip-progress__line-graph__chert {
  height: 0.5rem;
  width: 1px;
  background-color: #242c52;
  display: block;
  opacity: 0;
}

.runflip-progress__line-graph__chert:nth-child(odd) {
  background-color: #323a61;
  height: 0.3rem;
}

.runflip-game-progress .runflip-game-photo {
  opacity: 1;
}

.coinflip-round-side-enter {
  opacity: 0;
}

.coinflip-round-side-enter-active {
  opacity: 1;
  transition: 0.5s;
}

.coinflip-round-side-exit {
  opacity: 1;
}

.coinflip-round-side-exit-active {
  opacity: 0;
  transform: scale(0.9);
  transition: 0.5s;
}

.runflip-game-side_anime {
  transition: 0.2s;
  opacity: 0;
}

.runflip-game-side_anime.show {
  opacity: 1;
}

.runflip {
  height: 100%;
  display: -webkit-box;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
}

.runflip-header {
  white-space: nowrap;
  padding-left: 4rem;
  position: relative;
  padding-right: 3rem;
  margin-right: auto;
}

.runflip-header svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 2.4rem;
  height: 2rem;
  fill: #ffce79;
}

.runflip-header__title {
  font-weight: 500;
  font-size: 1.4rem;
  text-transform: uppercase;
  margin-bottom: 0.15em;
}

.runflip-header__desc {
  font-weight: 500;
  color: rgba(205, 215, 252, 0.35);
  font-size: 1.1rem;
  text-transform: uppercase;
}

.runflip-form {
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  padding: 0 4rem 2rem;
  flex-shrink: 0;
  gap: 2rem;
  -webkit-transition: 0;
  transition: 0;
  flex-wrap: wrap;
}

@media only screen and (max-width: 1023px) {
  .runflip-form {
    display: none;
  }
}

.runflip-form .fields-set {
  margin-right: 4rem;
}

.runflip-form .select-wrapper:not(:last-child) {
  margin-right: 4rem;
}

@media only screen and (max-width: 2100px) {
  .chat-active .runflip-form .runflip-header {
    margin-right: 0;
    width: 50%;
    margin-bottom: 1.5rem;
  }

  .chat-active .runflip-form .fields-set {
    margin-right: 0;
    width: 50%;
    margin-bottom: 1.5rem;
  }

  .chat-active .runflip-form .fields-set .field-wrapper:last-child {
    padding-right: 0;
  }
}

.select-wrapper {
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
}

.select-wrapper__title {
  color: #b5bdda;
  font-weight: 500;
  font-size: 1.3rem;
  white-space: nowrap;
  margin-right: 1.5rem;
  text-transform: uppercase;
}

.runflip-list {
  display: grid;
  height: 100%;
  gap: .6rem;
  overflow: auto;
  align-content: flex-start;
  grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
}

@media only screen and (min-width: 1023px) {
  .runflip-list {
    width: calc(100% - 2rem);
    padding: 0 2rem 0 4rem;
    margin-right: 2rem;
    grid-template-columns: repeat(auto-fill, minmax(37rem, 1fr));
    gap: 1.6rem;
  }
}

.runflip-game {
  background-color: #1c2344;
  border-radius: 1rem;
  padding: 1.2rem;
  height: 16rem;
  position: relative;
}

@media only screen and (min-width: 1023px) {
  .runflip-game {
    height: 20.5rem;
  }
}

.runflip-game-sides {
  display: -webkit-box;
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: stretch;
  align-items: stretch;
  height: 100%;
  --middle-width: 7rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-sides {
    --middle-width: 8.5rem;
  }
}

.runflip-game-info {
  text-align: center;
  display: -webkit-box;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  flex-direction: column;
  -webkit-box-pack: justify;
  justify-content: space-between;
  position: relative;
  width: calc(var(--middle-width) - .7rem * 2);
  margin: 0 -.7rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-info {
    width: calc(var(--middle-width) - 1.4rem * 2);
    margin: 0 -1.4rem;
  }
}

.runflip-game-side {
  background-color: #242c52;
  padding: 1.1rem 1.3rem;
  border-radius: 1rem;
  width: calc(50% - var(--middle-width) / 2);
  text-align: center;
  position: relative;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-side {
    padding: 1.5rem 1.3rem;
  }
}

.runflip-game-side.disabled {
  background-color: #171d39;
}

.runflip-game-side__icon {
  background-size: contain;
  width: 4.5rem;
  height: 4.5rem;
  background-position: center;
  position: absolute;
  left: calc(50% - 4.5rem / 2);
  bottom: .8rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-side__icon {
    bottom: 1.6rem;
  }
}

.runflip-game-side--blue .runflip-game-side__icon {
  background-image: url(../assets/images/side-blue.png);
}

.runflip-game-side--green .runflip-game-side__icon {
  background-image: url(../assets/images/side-green.png);
}

.runflip-game-side::after {
  content: '';
  width: 100%;
  height: 5.9rem;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-size: contain;
  background-position: center bottom;
  pointer-events: none;
}

.runflip-game-side--blue::after {
  background-image: url(../assets/images/runflip-blue-light.png);
}

.runflip-game-side--green::after {
  background-image: url(../assets/images/runflip-green-light.png);
}

.runflip-game-side__main {
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  height: 4.5rem;
  margin-bottom: 0.5rem;
  position: relative;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-side__main {
    margin-bottom: 0.8rem;
    height: 6rem;
  }
}

.runflip-game-side__main .btn {
  width: 100%;
  height: 3.5rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-side__main .btn {
    height: 4.5rem;
  }
}

.runflip-game-side__main--has-hover .runflip-game-drop {
  opacity: 0;
  -webkit-transition: .2s;
  transition: .2s;
}

.runflip-game-side__main--has-hover .runflip-game-photo {
  opacity: 1;
  -webkit-transition: .2s;
  transition: .2s;
}

.runflip-game-side__main--has-hover:hover .runflip-game-drop {
  opacity: 1;
}

.runflip-game-side__main--has-hover:hover .runflip-game-photo {
  opacity: 0;
  -webkit-filter: blur(0.5rem);
  filter: blur(0.5rem);
}

.runflip-game-side__title {
  font-size: 1.2rem;
  font-weight: 500;
  color: #979db6;
  margin-bottom: 0.4em;
}

@media only screen and (max-width: 1023px) {
  .runflip-game-side__title {
    display: none;
  }
}

.runflip-game-side__price {
  color: #ffce79;
  font-size: 1.3rem;
}

.runflip-game-side.disabled::before, .runflip-game-side.disabled::after,
.runflip-game-side.disabled .runflip-game-side__main,
.runflip-game-side.disabled .runflip-game-side__title,
.runflip-game-side.disabled .runflip-game-side__price,
.runflip-game-side.disabled .runflip-game-side__icon {
  opacity: 0.3;
}

.runflip-game-countdown {
  height: 5rem;
  width: 5rem;
  background-image: url(../assets/images/counter-circle.svg);
  background-size: cover;
  background-position: center;
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  font-size: 2.4rem;
  color: #b5bdda;
  font-weight: 500;
  position: absolute;
  top: calc(50% - 5rem / 2);
  left: calc(50% - 5rem / 2);
  opacity: 0;
}

.runflip-game-status {
  text-shadow: 0px 0.3rem 0.8rem rgba(255, 47, 6, 0.5);
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: .5rem;
  line-height: 2.2rem;
  text-transform: uppercase;
  position: absolute;
  left: 0;
  right: 0;
  top: .6rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-status {
    top: 1.1rem;
  }
}

.runflip-game-status--orange {
  background-color: #f6af54;
}

.runflip-game-status--blue {
  background-color: #4980cf;
  text-shadow: none;
}

.runflip-game-status--green {
  background-color: #4d9c60;
  text-shadow: none;
}

.runflip-game-vs {
  font-size: 2.4rem;
  font-weight: 500;
  text-transform: uppercase;
  color: #b5bdda;
  position: absolute;
  top: calc(50% - 1rem);
  left: 0;
  right: 0;
}

.runflip-game-desc {
  font-size: 1.2rem;
  font-weight: 500;
  color: #535a77;
  position: absolute;
  left: 0;
  right: 0;
  bottom: .6rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-desc {
    bottom: 1.1rem;
  }
}

.runflip-game-desc:hover {
  color: #a3abc6;
}

.runflip-game-drop {
  height: 7rem;
  width: 7rem;
  margin-top: 2rem;
  margin-left: auto;
  margin-right: auto;
  position: absolute;
  top: calc(50% - 1.2rem);
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

@media only screen and (min-width: 1023px) {
  .runflip-game-drop {
    height: 9rem;
    width: 9rem;
    margin-top: 3rem;
  }
}

.runflip-game-drop__count {
  position: absolute;
  font-size: 1rem;
  right: -1.2rem;
  height: 1.8rem;
  min-width: 2rem;
  top: 3.5rem;
  border: 2px solid #3b446d;
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  border-radius: .5rem;
  font-weight: 500;
  padding: 0 .2rem;
  color: #979db6;
  line-height: 1;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-drop__count {
    top: .2rem;
    height: 2.3rem;
    min-width: 2.3rem;
    top: -.5rem;
    right: -1rem;
    font-size: 1.1rem;
  }
}

.runflip-game-drop img {
  height: 100%;
  width: 100%;
  -o-object-fit: contain;
  object-fit: contain;
  -o-object-position: center;
  object-position: center;
  border-radius: 1rem;
  -webkit-transform: translateY(-15%);
  transform: translateY(-15%);
}

.runflip-game-photo {
  margin-left: auto;
  margin-right: auto;
  position: relative;
  height: 4.5rem;
  width: 4.5rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-photo {
    height: 6rem;
    width: 6rem;
  }
}

.runflip-game-photo__label {
  position: absolute;
  top: -.4rem;
  left: -1.3rem;
  background-color: #fe5454;
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  padding: 0 .7rem;
  line-height: 2.2rem;
  border-radius: .5rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-photo__label {
    top: -.7rem;
  }
}

.runflip-game-photo img {
  height: 100%;
  width: 100%;
  -o-object-fit: cover;
  object-fit: cover;
  -o-object-position: center;
  object-position: center;
  border-radius: 1.5rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-photo img {
    border-radius: 2rem;
  }
}

.runflip-game-progress {
  position: relative;
  height: 100%;
  padding: .5rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress {
    padding: 1rem;
  }
}

.runflip-game-progress::before {
  content: '';
  position: absolute;
  bottom: -1.2rem;
  left: 0;
  right: 0;
  height: 6.1rem;
  background-image: url(../assets/images/runflip-orange-light.png);
  background-size: contain;
  background-position: center bottom;
}

.runflip-game-progress .runflip-game-photo {
  height: 4rem;
  width: 4rem;
  position: relative;
  top: 0;
  left: 0;
  -webkit-transform: none;
  transform: none;
  opacity: 0;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress .runflip-game-photo {
    height: 5rem;
    width: 5rem;
  }
}

.runflip-game-progress__item {
  display: -webkit-box;
  display: flex;
  -webkit-box-align: end;
  align-items: flex-end;
  position: relative;
  margin-bottom: 1.5rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress__item {
    margin-bottom: 2rem;
  }
}

.runflip-game-progress__footer {
  text-align: center;
  position: absolute;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  width: -webkit-min-content;
  width: -moz-min-content;
  width: min-content;
  white-space: nowrap;
  bottom: -.7rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress__footer {
    bottom: 0;
  }
}

.runflip-game-progress__footer svg {
  position: absolute;
  fill: #f6af54;
  width: 2rem;
  height: 2.33333rem;
  bottom: .5rem;
  opacity: 0;
  -webkit-transform-origin: center bottom;
  transform-origin: center bottom;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress__footer svg {
    width: 2.4rem;
    height: 2.8rem;
    bottom: .2rem;
  }
}

.runflip-game-progress__footer svg:first-of-type {
  right: -2.91667rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress__footer svg:first-of-type {
    right: -3.5rem;
  }
}

.runflip-game-progress__footer svg:last-of-type {
  left: -2.91667rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress__footer svg:last-of-type {
    left: -3.5rem;
  }
}

.runflip-game-progress__footer-title {
  font-weight: 500;
  color: #cbd0e1;
  font-size: 1.4rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress__footer-title {
    font-size: 1.8rem;
  }
}

.runflip-game-progress__footer-desc {
  cursor: pointer;
  color: #535a77;
  font-weight: 500;
  font-size: 1.1rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress__footer-desc {
    font-size: 1.2rem;
  }
}

.runflip-game-progress__footer-desc:hover {
  color: #a3abc6;
}

.runflip-game-progress__info {
  position: absolute;
  left: 5.8rem;
  top: -.2rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress__info {
    top: .2rem;
    left: 6.8rem;
  }
}

.runflip-game-progress__info-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #979db6;
  margin-bottom: 0.2em;
  opacity: 0;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress__info-name {
    font-size: 1.2rem;
  }
}

.runflip-game-progress__info-price {
  font-weight: 500;
  color: #ffce79;
  font-size: 1.1rem;
  opacity: 0;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-progress__info-price {
    font-size: 1.3rem;
  }
}

.runflip-progress {
  padding-left: 1rem;
  margin-bottom: .5rem;
  width: calc(100% - 5rem);
}

@media only screen and (min-width: 1023px) {
  .runflip-progress {
    width: calc(100% - 6rem);
  }
}

.runflip-progress__line {
  height: 0.4rem;
  background-color: #242c52;
  border-radius: 99rem;
  position: relative;
}

.runflip-progress__line-current {
  height: 100%;
  background-color: #508aff;
  border-radius: 99rem;
  position: relative;
  width: 0;
}

.runflip-progress__line-current i {
  position: absolute;
  top: -3rem;
  right: -0.76923rem;
  width: 2.61538rem;
  height: 2.61538rem;
  background-size: contain;
  background-position: center;
  opacity: 0;
  -webkit-transform-origin: 70% 110%;
  transform-origin: 70% 110%;
}

@media only screen and (min-width: 1023px) {
  .runflip-progress__line-current i {
    top: -3.9rem;
    right: -1rem;
    width: 3.4rem;
    height: 3.4rem;
  }
}

.runflip-progress__line-graph {
  display: -webkit-box;
  display: flex;
  justify-content: space-around;
  position: absolute;
  bottom: -1rem;
  left: 0;
  right: 0;
}

.runflip-progress__line-graph i {
  height: .5rem;
  width: 1px;
  background-color: #242c52;
  display: block;
  opacity: 0;
}

.runflip-progress__line-graph i:nth-child(odd) {
  background-color: #323a61;
  height: .3rem;
}

.runflip-progress--blue .runflip-progress__line-current {
  background-color: #508aff;
}

.runflip-progress--blue .runflip-progress__line-current i {
  background-image: url(../assets/images/runner-blue.gif);
}

.finished .runflip-progress--blue .runflip-progress__line-current i {
  background-image: url(../assets/images/runner-blue-stop.gif);
}

.runflip-progress--green .runflip-progress__line-current {
  background-color: #4d9c60;
}

.runflip-progress--green .runflip-progress__line-current i {
  background-image: url(../assets/images/runner-green.gif);
}

.finished .runflip-progress--green .runflip-progress__line-current i {
  background-image: url(../assets/images/runner-green-stop.gif);
}

.runflip-game-winner {
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.runflip-game-winner::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  background-size: contain;
  background-position: center;
  opacity: 0.5;
  width: 8rem;
  height: 8rem;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-winner::before {
    width: 12rem;
    height: 12rem;
  }
}

.runflip-game-winner::after {
  content: '';
  width: 2.71429rem;
  height: 3.92857rem;
  background-image: url(../assets/images/person-blue.png);
  display: block;
  background-size: contain;
}

@media only screen and (min-width: 1023px) {
  .runflip-game-winner::after {
    width: 3.8rem;
    height: 5.5rem;
  }
}

.runflip-game-winner--blue::before {
  background-image: url(../assets/images/runflip-blue-circle-light.png);
}

.runflip-game-winner--blue::after {
  background-image: url(../assets/images/person-blue.png);
}

.runflip-game-winner--green::before {
  background-image: url(../assets/images/runflip-green-circle-light.png);
}

.runflip-game-winner--green::after {
  background-image: url(../assets/images/person-green.png);
}

.runflip-profile {
  overflow-y: auto;
}

@media only screen and (min-width: 1023px) {
  .runflip {
    padding-top: 4rem;
  }
}

.runflip-profile .runflip-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.runflip-profile .runflip-list .runflip-game {
  width: calc(52% - 2.4rem);
}
</style>