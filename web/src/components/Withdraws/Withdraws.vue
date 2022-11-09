<template>
  <div class="table-wrapper">
    <table class="table">
      <thead>
      <tr>
        <td>Дата</td>
        <td>Вещи</td>
        <td>Сумма</td>
        <td>Статус</td>
      </tr>
      </thead>
      <tbody>
      <tr v-for="withdraw in withdraws" :key="withdraw.id">
        <td>{{ dateFormatted(withdraw.created_at) }} </td>
        <td>
          <div class="bets__product-list">
            <div class="bets__product">
              <div class="bets__product-image-wrapper">
                <img :src="`https://steamcommunity-a.akamaihd.net/economy/image/${withdraw.item.icon_url}/360fx360f`" alt="" class="bets__product-image">
              </div>
              <span class="bets__product-angle bets__product-angle--restricted"></span>
            </div>
          </div>
        </td>
        <td>
          <span class="table__sum">$ {{ withdraw.item.price.toFixed(2) }}</span>
        </td>
        <td>
          <span v-if="withdraw.status === 0"  class="table__status-message table__status-message--pending">
            Обработка
            <span class="icon icon--pending"></span>
          </span>
          <span v-if="withdraw.status === 1" class="table__status-message table__status-message--success">
            Успешно
            <span class="icon icon--success"></span>
          </span>
          <span v-if="withdraw.status === 2" class="table__status-message table__status-message--error">
            Ошибка
            <span class="icon icon--error"></span>
          </span>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: ['withdraws'],
  methods: {
    dateFormatted(date) {
      let d = new Date(date);

      return ("0" + d.getDate()).slice(-2) + '.' + ("0" + (parseInt(d.getMonth()) + 1)).slice(-2)  + '.' + d.getFullYear();
    }
  }
}
</script>