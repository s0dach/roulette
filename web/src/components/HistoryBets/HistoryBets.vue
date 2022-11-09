<template>
  <div class="table-wrapper">
    <table class="table">
      <thead>
      <tr>
        <td>ID</td>
        <td>Вещи</td>
        <td>Статус</td>
        <td>Множитель</td>
        <td>Доход</td>
        <td>Дата</td>
      </tr>
      </thead>
      <tbody>
      <tr v-for="bet in bets" :key="bet.gameid">
        <td><router-link :to="`/game/${bet.game_id}`" style="color: #3c465e; text-decoration: none;">{{ bet.game_id }}</router-link></td>
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
          <span v-if="bet.status === 2" class="table__status table__status--red">LOSE</span>
          <span v-else-if="bet.status === 1" class="table__status table__status--green">WIN</span>
          <span v-else class="table__status">WAIT</span>
        </td>
        <td><span class="table__multiply">{{ parseFloat(bet.multiplier).toFixed(2) }}x</span></td>
        <td>
          <span v-if="bet.status === 2" class="table__status table__status--red">- $ {{ bet.sum.toFixed(2) }}</span>
          <span v-if="bet.status === 1" class="table__status table__status--green">+ $ {{ (bet.win.toFixed(2) - bet.sum.toFixed(2)).toFixed(2) }}</span>
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
