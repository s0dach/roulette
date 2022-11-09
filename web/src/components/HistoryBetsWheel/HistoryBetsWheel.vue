<template>
  <div class="table-wrapper">
    <table class="table">
      <thead>
      <tr>
        <td>ID</td>
        <td>Ставка</td>
        <td>Скины</td>
        <td>Выигрыш</td>
        <td>Дата</td>
      </tr>
      </thead>
      <tbody>
      <tr v-for="bet in bets" :key="bet.gameid">
        <td>{{ bet.gameid }}</td>
        <td>{{ bet.bet.toFixed(2) }} $</td>
        <td>
          <div v-if="$resize && $mq.below(1024)" class="bets__product-list">
            <div class="bets__product" v-for="(item, itemId) in Object.keys(bet.items).sort(( (e, t) => {
                    return bet.items[t].price - bet.items[e].price
                  })).slice(0, 1)" :key="itemId">
              <div class="bets__product-image-wrapper">
                <img :src="'https://community.cloudflare.steamstatic.com/economy/image/' + bet.items[item].icon_url + '/360fx360f'" alt="" class="bets__product-image">
              </div>
              <span :class="'bets__product-angle bets__product-angle--' + $root.getStyleItem(bet.items[item].rarity)"></span>
            </div>
            <span class="bets__plus-one" v-if="Object.keys(bet.items).length > 1">+{{ Object.keys(bet.items).length - 1 }}</span>
          </div>
          <div class="bets__product-list" v-else>
            <div class="bets__product" v-for="(item, itemId) in Object.keys(bet.items).sort(( (e, t) => {
                    return bet.items[t].price - bet.items[e].price
                  })).slice(0, 3)" :key="itemId">
              <div class="bets__product-image-wrapper">
                <img :src="'https://community.cloudflare.steamstatic.com/economy/image/' + bet.items[item].icon_url + '/360fx360f'" alt="" class="bets__product-image">
              </div>
              <span :class="'bets__product-angle bets__product-angle--' + $root.getStyleItem(bet.items[item].rarity)"></span>
            </div>
            <span class="bets__plus-one" v-if="Object.keys(bet.items).length > 3">+{{ Object.keys(bet.items).length - 3 }}</span>
          </div>
        </td>
        <td>
          <template v-if="bet.win > 0">
            <span>{{ bet.win.toFixed(2) }} $</span>
            <div class="bets__product">
              <div class="bets__product-image-wrapper">
                <img :src="'https://community.cloudflare.steamstatic.com/economy/image/' + bet.win_item.icon_url + '/360fx360f'" alt="" class="bets__product-image">
              </div>
              <span :class="'bets__product-angle bets__product-angle--' + $root.getStyleItem(bet.win_item.rarity)"></span>
            </div>
          </template>
        </td>
        <td>{{ getDate(bet.created_at) }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: ['bets'],
  methods: {
    getDate(date) {
      let d = new Date(date);

      return ("0" + d.getDate()).slice(-2) + '.' + ("0" + (parseInt(d.getMonth()) + 1)).slice(-2)  + '.' + d.getFullYear();
    }
  }
}
</script>
