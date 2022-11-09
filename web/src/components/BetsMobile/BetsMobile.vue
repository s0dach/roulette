<template>
  <div class="bets-wrapper">
    <div class="bets-shadow"></div>

    <div class="bets bets--mobile">
      <div class="bets__item" v-for="(bet, id) in bets" :key="id">
        <span class="bets__line" v-if="bet.status === 0 && (game.status === 'timer' || game.status === 'crash')"></span>
        <span class="bets__line bets__line--win" v-if="bet.status === 1"></span>
        <span class="bets__line bets__line--fail" v-if="bet.status === 2 && game.status === 'crashed'"></span>

        <router-link tag="div" :to="{name: 'User', params: { id: bet.user.steamid }}" class="bets__pic-wrapper bets__pic-wrapper--mobile">
          <img :src="bet.user.avatar" alt="" class="bets__pic">
        </router-link>

        <div class="bets__product-list bets__product-list--mobile">
          <div class="bets__product bets__product--mobile" v-for="(item, itemId) in Object.keys(bet.items).sort(( (e, t) => {
             return bet.items[t].price - bet.items[e].price
          })).slice(0, 1)" :key="itemId">
            <div class="bets__product-image-wrapper">
              <img :src="'https://community.cloudflare.steamstatic.com/economy/image/' + bet.items[item].icon_url + '/360fx360f'" alt="" class="bets__product-image">
            </div>
            <span :class="'bets__product-angle bets__product-angle--' + $root.getStyleItem(bet.items[item].rarity)"></span>
          </div>
          <span class="bets__plus-one" v-if="Object.keys(bet.items).length > 1">+{{
              Object.keys(bet.items).length - 1
            }}</span>
        </div>

        <template v-if="bet.status === 0 && (game.status === 'timer' || game.status === 'crash')">
          <span class="bets__price bets__price--mobile">$ {{ bet.sum.toFixed(2) }}</span>
        </template>

        <template v-if="bet.status === 1">
          <span class="bets__multiplier bets__multiplier--green">
            {{ bet.multiplier.toFixed(2) }}x
            <span class="icon icon--green-arrow-top"></span>
          </span>

          <div class="bets__win-part bets__win-part--mobile">
            <span class="bets__win-price">$ {{ bet.win.toFixed(2) }}</span>
          </div>
        </template>

        <template v-if="bet.status === 2 && game.status === 'crashed'">
          <span class="bets__multiplier bets__multiplier--red">{{ game.multiplier.toFixed(2) }}x</span>

          <div class="bets__fail-part bets__fail-part--mobile">
            <span class="bets__fail-text">crash</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['game', 'bets'],
}
</script>

<style lang="scss" src="@/components/Bets/Bets.scss"></style>