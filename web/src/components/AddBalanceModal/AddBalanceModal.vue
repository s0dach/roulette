<template>
  <div class="add-balance-modal">
    <h3 class="add-balance-modal__title">Пополнение баланса</h3>

    <div class="add-balance-modal__form-sum">
      <span class="add-balance-modal__label">Сумма пополнения:</span>

      <label class="add-balance-modal__text-input-wrapper">
        <span class="add-balance-modal__text-input-currency">$</span>
        <input v-model.number="sumValue" class="add-balance-modal__text-input" type="number"  placeholder="">
      </label>
    </div>

<!--    <span class="add-balance-modal__label">Выбор платежной системы:</span>-->

<!--    <div class="add-balance-modal__pay-methods-list">-->
<!--      <label v-for="method in payMethods" class="add-balance-modal__item">-->
<!--        <input type="radio" :value="method.name" v-model="selectedPayMethod" name="pay-systems">-->
<!--        <span class="add-balance-modal__item-background">-->
<!--          <img :src="method.picture" :alt="method.name" class="add-balance-modal__method-logo">-->
<!--        </span>-->
<!--      </label>-->
<!--    </div>-->

    <button :disabled="sumValue <= 0" @click="depositSum" class="button button--go-add-balance">Перейти к оплате</button>

    <button class="modal-close" @click="$modal.hide('add-balance')"></button>
  </div>
</template>

<script lang="js">
export default {
  name: 'AddBalanceModal',
  data() {
    return {
      sumValue: 1,
      selectedPayMethod: null,
      payMethods: [
        {
          name: 'paypal',
          picture: '/images/pay-systems/paypal.png'
        },
        {
          name: 'qiwi',
          picture: '/images/pay-systems/qiwi.png'
        },
        {
          name: 'webmoney',
          picture: '/images/pay-systems/webmoney.png'
        },
        {
          name: 'sberbank',
          picture: '/images/pay-systems/sberbank.png'
        },
        {
          name: 'alipay',
          picture: '/images/pay-systems/alipay.png'
        },
        {
          name: 'visa',
          picture: '/images/pay-systems/visa.png'
        }
      ]
    }
  },
  methods: {
    depositSum() {
      this.$root.request('POST', '/payment/pay', {
        sum: this.sumValue,
        method: 'unitpay'
      }).then(response => {
        this.$root.showNotify('success', 'Сейчас Вы будете перенаправлены на платежную систему');

        setTimeout(() => {
          window.location.href = response.url;
        }, 1500);
      }).catch(err => {
        this.$root.showNotify('error', err);
      })
    }
  }
}
</script>

<style lang="scss" src="./AddBalanceModal.scss"></style>