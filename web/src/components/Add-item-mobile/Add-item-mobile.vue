<template>
  <div class="add-item-mobile">
    <div class="add-item-mobile__add" @click="$modal.show('inventory-modal')">
      <span class="add-item-mobile__add-plus">+</span>
      <span class="add-item-mobile__add-text">Добавить предмет</span>
    </div>

    <div class="add-item-mobile__digits">
      <span class="add-item-mobile__digits-item" v-if="!bet">$ 0.00</span>
      <span class="add-item-mobile__digits-item" v-else-if="bet">$ {{ bet.sum.toFixed(2) }}</span>
      <span class="add-item-mobile__digits-item" v-if="!bet">$ 0.00</span>
      <span class="add-item-mobile__digits-item" v-else-if="bet && bet.status !== 1">$ {{ (bet.sum * game.multiplier).toFixed(2) }}</span>
      <span class="add-item-mobile__digits-item" v-else-if="bet && bet.status === 1">$ {{ (bet.win).toFixed(2) }}</span>
    </div>

    <div class="add-item-mobile__form">
      <div class="game__row game__row--border-top">
        <div class="game__main-column game__main-column--mobile">
          <span class="game__title-label">Авто-вывод</span>
          <div class="game__auto-output-wrapper game__auto-output-wrapper--mobile">
            <label class="game__auto-output game__auto-output--mobile">
              <input type="text" class="game__auto-output-input game__auto-output-input--mobile" v-model="auto_withdraw">
              <span class="game__auto-output-x game__auto-output-x--mobile">x</span>
            </label>
          </div>
        </div>

        <div class="game__side-column game__side-column--mobile">
          <span class="game__title-label">Ставка</span>
          <button
              v-if="bet && bet.status === 1"
              disabled
              class="button button--start-game"
          >Забрать $ {{ (bet.win).toFixed(2) }}</button>
          <button
              v-else-if="!bet || game.status === 'timer'"
              :disabled="Object.keys(userInventory.selected.items).length === 0 || game.status !== 'timer'"
              @click="placeBet"
              class="button button--start-game"
          >Начать $ {{ userInventory.selected.price.toFixed(2) }}</button>
          <button
              v-else-if="bet && game.status !== 'timer' && bet.status !== 1"
              @click="takeBet"
              class="button button--start-game"
          >Забрать $ {{ (bet.sum * game.multiplier).toFixed(2) }}</button>
        </div>
      </div>
    </div>

    <div class="game__bets-timer game__bets-timer--mobile game__bets-timer--animated">
      <div class="game__bets-timer-column">
        <span
            class="game__bets-timer-text game__bets-timer-text--mobile"
            v-if="game.status === 'timer'"
        >Прием: {{ game.time.toFixed(2) }}c.</span>
        <span
            class="game__bets-timer-text game__bets-timer-text--mobile"
            v-else-if="game.status === 'crash'"
        >Игра началась</span>
        <span
            class="game__bets-timer-text game__bets-timer-text--mobile"
            v-else-if="game.status === 'crashed'"
        >Игра окончена</span>
      </div>
      <div class="game__bets-timer-column game__bets-timer-column--center">
        <span class="icon icon--gun"></span>
        <span class="game__bets-timer-gun-value game__bets-timer-gun-value--mobile">{{ game.skins }}</span>
      </div>
      <div class="game__bets-timer-column game__bets-timer-column--right">
        <span class="icon icon--refresh"></span>
        <span class="game__bets-refresh-value game__bets-refresh-value--mobile">{{ game.members }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['game', 'bet', 'userInventory'],
  data() {
    return {
      lastSelects: [],
      auto_withdraw: '2.00'
    }
  },
  mounted() {
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

<style src="./Add-item-mobile.scss" lang="scss"></style>