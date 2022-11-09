<template>
  <div class="about" v-if="game !== null">
    <div class="game__bets-timer game__bets-timer--animated">
      <div class="game__bets-timer-column">
        <span class="game__bets-timer-text">Игра #{{ game.id }}</span>
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

    <BetsMobile v-if="$resize && $mq.below(1024)" :game="game" :bets="bets" />
    <Bets v-else :game="game" :bets="bets" />
  </div>
</template>

<script>
import Bets from "@/components/Bets/Bets";
import BetsMobile from "@/components/BetsMobile/BetsMobile";

export default {
  components: {
    BetsMobile,
    Bets
  },
  name: "Game",
  data() {
    return {
      game: null,
      bets: null
    }
  },
  mounted() {
    this.getGame();
  },
  methods: {
    getGame() {
      this.$root.request('GET', `/crash/byId/${this.$route.params.id}`).then(data => {
        this.game = data.game;
        this.bets = data.bets
        this.game.status = 'crashed';

        this.bets.sort((a, b) => {
          if (b.sum < a.sum) return -1;
        });
      }).catch(() => {
        this.$router.back();
      });
    }
  }
}
</script>