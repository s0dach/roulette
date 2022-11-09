<template>
  <div class="runflip runflip-profile">
    <div class="runflip-list">
      <div class="runflip-game finished" v-for="game in bets">
        <div class="runflip-game-progress" style="transform: scale(1); opacity: 1;">
          <router-link tag="a" :to="{name: 'User', params: {id: game.blue_user.steamid}}"
                       class="runflip-game-progress__item">
            <div class="runflip-game-photo" style="transform: translateX(0rem); opacity: 1;">
              <img
                  :src="game.blue_user.avatar"
                  alt="">
              <div v-if="$root.user !== null && game.blue_user.steamId === $root.user.steamid" class="runflip-game-photo__label">Вы</div>
            </div>
            <div class="runflip-game-progress__info">
              <div class="runflip-game-progress__info-name" style="transform: translateY(0rem); opacity: 1;">
                {{ game.blue_user.username }}
              </div>
              <div
                  v-if="game.win_side === 'green'"
                  class="runflip-game-progress__info-price red"
                  style="transform: translateY(0rem); opacity: 1;"
              >-{{ game.blue_sum.toFixed(2) }}
                $
              </div>
              <div v-else class="runflip-game-progress__info-price " style="transform: translateY(0rem); opacity: 1;">{{ game.win.toFixed(2) }} $</div>
            </div>
            <div class="runflip-progress runflip-progress--blue">
              <div v-if="game.win_side === 'green'" class="runflip-progress__line" style="width: 100%;">
                <div class="runflip-progress__line-current runflip-progress__line-current__looser " style="width: 90%;">
                  <i
                      style="transform: translateX(0rem) rotate(90deg) translateY(50%); opacity: 1;"></i></div>
                <div class="runflip-progress__line-graph"><i style="transform: translateY(0rem); opacity: 1;"></i><i
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
              <div v-else class="runflip-progress__line" style="width: 100%;">
                <div class="runflip-progress__line-current  " style="width: 100%;"><i
                    style="transform: translateX(0rem); opacity: 1;"></i></div>
                <div class="runflip-progress__line-graph"><i style="transform: translateY(0rem); opacity: 1;"></i><i
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
          </router-link>
          <router-link tag="a" :to="{name: 'User', params: {id: game.green_user.steamid}}"
                       class="runflip-game-progress__item">
            <div class="runflip-game-photo" style="transform: translateX(0rem); opacity: 1;">
              <img
                  :src="game.green_user.avatar"
                  alt="">
              <div v-if="$root.user !== null && game.green_user.steamId === $root.user.steamid" class="runflip-game-photo__label">Вы</div>
            </div>
            <div class="runflip-game-progress__info">
              <div class="runflip-game-progress__info-name" style="transform: translateY(0rem); opacity: 1;">
                {{ game.green_user.username }}
              </div>
              <div
                  v-if="game.win_side === 'blue'"
                  class="runflip-game-progress__info-price red"
                  style="transform: translateY(0rem); opacity: 1;"
              >-{{ game.green_sum.toFixed(2) }}
                $
              </div>
              <div v-else class="runflip-game-progress__info-price " style="transform: translateY(0rem); opacity: 1;">{{ game.win.toFixed(2) }} $</div>
            </div>
            <div class="runflip-progress runflip-progress--green">
              <div v-if="game.win_side === 'blue'" class="runflip-progress__line" style="width: 100%;">
                <div class="runflip-progress__line-current runflip-progress__line-current__looser " style="width: 90%;">
                  <i
                      style="transform: translateX(0rem) rotate(90deg) translateY(50%); opacity: 1;"></i></div>
                <div class="runflip-progress__line-graph"><i style="transform: translateY(0rem); opacity: 1;"></i><i
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
              <div v-else class="runflip-progress__line" style="width: 100%;">
                <div class="runflip-progress__line-current  " style="width: 100%;"><i
                    style="transform: translateX(0rem); opacity: 1;"></i></div>
                <div class="runflip-progress__line-graph"><i style="transform: translateY(0rem); opacity: 1;"></i><i
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
          </router-link>
          <div class="runflip-game-progress__footer">
            <svg aria-hidden="true" style="transform: rotate(20deg); opacity: 1;">
              <use xlink:href="/svg/svg.svg#start"></use>
            </svg>
            <div class="runflip-game-progress__footer-title" style="transform: translateY(0rem); opacity: 1;">Финиш</div>
            <form :id="`fairy_${game.id}`" action="https://api.random.org/verify" method="post" target="_blank">
              <input type="hidden" name="format" value="json">
              <input type="hidden" name="random" :value="JSON.stringify(game.random)">
              <input type="hidden" name="signature" :value="game.signature">
            </form>
            <a @click="openFair(game.id)" class="runflip-game-progress__footer-desc">Честная игра</a>
            <svg aria-hidden="true" style="transform: rotate(-20deg); opacity: 1;">
              <use xlink:href="/svg/svg.svg#start-right"></use>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'

export default {
  props: ['bets', 'user'],
  methods: {
    getDate(date) {
      let d = new Date(date);

      return ("0" + d.getDate()).slice(-2) + '.' + ("0" + (parseInt(d.getMonth()) + 1)).slice(-2) + '.' + d.getFullYear();
    },
    openFair(id) {
      $(`#fairy_${id}`).submit()
    }
  }
}
</script>
