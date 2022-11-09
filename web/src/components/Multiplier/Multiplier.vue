<template>
  <div class="multiplier-wrapper" v-if="Object.keys(history).length > 0">
    <ul class="multiplier">
      <router-link tag="li" :to="'/game/' + game.id" class="multiplier__item" v-for="(game, id) in history" :key="id">
        <span class="multiplier__link" :class="getStyleGame(game.multiplier)">{{ game.multiplier.toFixed(2) }}x</span>
      </router-link>
    </ul>
    <div class="multiplier-wrapper__shadow"></div>
  </div>
</template>

<style lang="scss" src="./Multiplier.scss"></style>

<script>
  export default {
    props: ['history'],
    methods: {
      getStyleGame(multiplier) {
        if (multiplier >= 1.00 && multiplier <= 1.20) {
          return 'multiplier__link--red';
        } else if (multiplier > 1.20 && multiplier < 2) {
          return '';
        } else if (multiplier > 2 && multiplier < 4.00) {
          return 'multiplier__link--green';
        } else if (multiplier > 4 && multiplier < 12) {
          return 'multiplier__link--violet';
        } else {
          return 'multiplier__link--orange';
        }
      }
    }
  }
</script>