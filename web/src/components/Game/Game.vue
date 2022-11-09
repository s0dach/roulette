<template>
  <div class="game widget" v-if="game">
    <div class="game__row">
      <div class="game__main-column">
        <div class="game__items-list">

          <template v-if="!bet && Object.keys(userInventory.selected.items).length > 0">
            <div
                :class="'game__item game__item--' + $root.getStyleItem(userInventory.selected.items[inv].item.rarity)"
                :key="id"
                v-for="(inv, id) in Object.keys(userInventory.selected.items).sort(( (e, t) => {
                    return userInventory.selected.items[t].item.price - userInventory.selected.items[e].item.price
                  })).slice(0, 3)"
            >
              <div class="game__item-pic-wrapper">
                <img :src="'https://community.cloudflare.steamstatic.com/economy/image/' + userInventory.selected.items[inv].item.icon_url + '/360fx360f'" alt="" class="game__item-pic">
              </div>
              <span class="game__item-price">$ {{ userInventory.selected.items[inv].item.price.toFixed(2) }}</span>
            </div>

            <div class="game__item-plus" v-if="Object.keys(userInventory.selected.items).length > 3">
              <span class="game__item-plus-value">+{{ Object.keys(userInventory.selected.items).length - 3 }}</span>
            </div>
          </template>

          <template v-if="bet && bet.status !== 1">
            <div
                :class="'game__item game__item--' + $root.getStyleItem(bet.items[inv].rarity)"
                :key="id"
                v-for="(inv, id) in Object.keys(bet.items).sort(( (e, t) => {
                    return bet.items[t].price - bet.items[e].price
                  })).slice(0, 3)"
            >
              <div class="game__item-pic-wrapper">
                <img :src="'https://community.cloudflare.steamstatic.com/economy/image/' + bet.items[inv].icon_url + '/360fx360f'" alt="" class="game__item-pic">
              </div>
              <span class="game__item-price">$ {{ bet.items[inv].price.toFixed(2) }}</span>
            </div>

            <div class="game__item-plus" v-if="Object.keys(bet.items).length > 3">
              <span class="game__item-plus-value">+{{ Object.keys(bet.items).length - 3 }}</span>
            </div>
          </template>

          <template v-if="bet && bet.status === 1 && this.bet.winItem !== null">
            <div :class="'game__item game__item--' + $root.getStyleItem(bet.winItem.rarity)">
              <div class="game__item-pic-wrapper">
                <img :src="'https://community.cloudflare.steamstatic.com/economy/image/' + bet.winItem.icon_url + '/360fx360f'" alt="" class="game__item-pic">
              </div>
              <span class="game__item-price">$ {{ bet.winItem.price.toFixed(2) }}</span>
            </div>
          </template>
        </div>
      </div>
      <div class="game__side-column">
        <span class="game__title-label">Показатели:</span>

        <div class="game__stats">
          <span class="game__stats-item" v-if="!bet">$ 0.00</span>
          <span class="game__stats-item" v-else-if="bet">$ {{ bet.sum.toFixed(2) }}</span>
          <span class="game__stats-item" v-if="!bet">$ 0.00</span>
          <span class="game__stats-item" v-else-if="bet && bet.status !== 1">$ {{ (bet.sum * game.multiplier).toFixed(2) }}</span>
          <span class="game__stats-item" v-else-if="bet && bet.status === 1">$ {{ (bet.win).toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div class="game__row game__row--border-top">
      <div class="game__main-column game__main-column--fixed-width game__main-column--padding">
        <span class="game__title-label">Авто-вывод</span>
        <div class="game__auto-output-wrapper">
          <label class="game__auto-output">
            <input type="text" class="game__auto-output-input" v-model="auto_withdraw">
            <span class="game__auto-output-x">x</span>
          </label>
          <span class="game__auto-output-divider"></span>
        </div>
      </div>

      <div class="game__main-column game__main-column--padding">
        <span class="game__title-label">Пред. выбор</span>
        <div class="game__pre-select-group">
          <label class="game__pre-select-button" v-for="select in lastSelects" @click="auto_withdraw = select">
            <input type="radio" name="game-pre-select" class="game__pre-select-radio">
            <span class="game__pre-select-content">
              {{ select }} <span class="game__pre-select-x">x</span>
            </span>
          </label>
        </div>
      </div>

      <div class="game__side-column">
        <span class="game__title-label">Ставка</span>
        <button
            v-if="bet && bet.status === 1"
            disabled
            class="button button--start-game"
          >Забрать $ {{ (bet.win).toFixed(2) }}
        </button>
        <button
            v-if="bet && game.status === 'timer'"
            disabled
            class="button button--start-game"
        >Забрать $ {{ (bet.sum).toFixed(2) }}
        </button>
        <button
            v-else-if="!bet || game.status === 'timer'"
            :disabled="Object.keys(userInventory.selected.items).length === 0 || game.status !== 'timer'"
            @click="placeBet"
            class="button button--start-game"
        >Начать $ {{ userInventory.selected.price.toFixed(2) }}
        </button>
        <button
            v-else-if="bet && game.status !== 'timer' && bet.status !== 1"
            @click="takeBet"
            class="button button--start-game"
        >Забрать $ {{ (bet.sum * game.multiplier).toFixed(2) }}
        </button>
      </div>
    </div>

    <div class="game__main-column game__main-column--padding game__main-column--padding__bottom">
      <button class="button" @click="editThresholdPresets = !editThresholdPresets">Редактировать</button>

      <div v-if="editThresholdPresets" class="game__pre-select-group game__main-column--padding__top">
        <input
            v-for="(v, i) in thresholdPresets"
            v-model.number="thresholdPresets[i]"
            class="threshold"
            title=""
            type="text"/>
      </div>

      <div v-else class="game__pre-select-group game__main-column--padding__top">
        <label class="game__pre-select-button" v-for="v in thresholdPresets" @click="auto_withdraw = v">
          <input type="radio" name="game-pre-select" class="game__pre-select-radio">
          <span class="game__pre-select-content">
            {{ v }}<span class="game__pre-select-x">x</span>
          </span>
        </label>
      </div>
    </div>
    
    <div class="game__bets-timer game__bets-timer--animated">
      <div class="game__bets-timer-column">
        <span class="game__bets-timer-text" v-if="game.status === 'timer'">Прием ставок: {{ game.time.toFixed(2) }}c.</span>
        <span class="game__bets-timer-text" v-else-if="game.status === 'crash'">Игра началась</span>
        <span class="game__bets-timer-text" v-else-if="game.status === 'crashed'">Игра окончена</span>
      </div>
      <div class="game__bets-timer-column game__bets-timer-column--center">
        <span class="icon icon--gun"></span>
        <span class="game__bets-timer-gun-value">{{ game.skins }}</span>
      </div>
      <div class="game__bets-timer-column game__bets-timer-column--right">
        <span class="icon icon--refresh"></span>
        <span class="game__bets-refresh-value">{{ game.members }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['game', 'bet', 'userInventory'],
  data() {
    return {
      editThresholdPresets: false,
      lastSelects: [],
      auto_withdraw: '2.00',
      thresholdPresets: [1.1, 1.2, 1.4, 1.8, 2, 3, 5],
    }
  },
  watch: {
    'thresholdPresets'() {
      this.$cookie.set('thresholdPresets', JSON.stringify(this.thresholdPresets), {expires: '1Y'})
    },
  },
  mounted() {
    if (this.$cookie.get('thresholdPresets') !== null) {
      this.thresholdPresets = JSON.parse(this.$cookie.get('thresholdPresets'))
    }

    if (localStorage.lastSelects) {
      this.lastSelects = JSON.parse(localStorage.lastSelects);
    }
  },
  methods: {
    placeBet() {
      this.$root.request('POST', '/crash/bet', {
        ids: Object.values(this.userInventory.selected.items).map((item) => {
          return item.id
        }),
        multiplier: parseFloat(this.auto_withdraw)
      }).then(() => {
        this.lastSelects.unshift(this.auto_withdraw);

        if (this.lastSelects.length > 3) {
          this.lastSelects.splice(-1, 1);
        }

        localStorage.setItem('lastSelects', JSON.stringify(this.lastSelects));

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
    takeBet() {
      this.$root.request('POST', '/crash/withdraw')
          .then(() => {

          })
          .catch(err => {
            this.$root.showNotify('error', err);
          })
    }
  }
}
</script>

<style lang="scss" src="./Game.scss"></style>