<template>
  <div class="pay-modal">
    <span class="pay-modal__title">Пополнение баланса</span>

    <span @click="$modal.show('add-balance')" class="pay-modal__item">
      <span class="pay-modal__item-title">Деньгами</span>
      <span class="pay-modal__background pay-modal__background--money"></span>
    </span>

    <a @click="redirectToSkinsBack" class="pay-modal__item">
      <span class="pay-modal__item-title">Вещами <br>из инвентаря Steam</span>
      <span class="pay-modal__background pay-modal__background--steam"></span>
    </a>

    <button class="modal-close" @click="$modal.hide('pay-modal')"></button>
  </div>
</template>

<script>
  export default {
    methods: {
      redirectToSkinsBack() {
        this.$root.request('POST', '/payment/pay', {
          sum: 0,
          method: 'skinsback'
        })
          .then((data) => {
            this.$root.showNotify('success', 'Сейчас Вы будете перенаправлены на платежную систему');

            setTimeout(() => {
              window.location.href = data.url;
            }, 1500);
          })
          .catch((e) => {
            this.$root.showNotify('error', e);
          })
      }
    }
  }
</script>

<style lang="scss" src="./PayModal.scss"></style>