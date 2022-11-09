<template>
  <div class="index-layout" v-if="user !== null">
    <div class="grid">
      <div v-if="$resize && $mq.below(1024)" class="grid__column grid__column--100">
        <div class="profile">
          <div class="profile__user-stats">
            <div class="profile__user-block">
              <div class="profile__user-pic-wrapper">
                <img :src="user.avatar" alt="" width="32" height="32" class="profile__user-pic">
              </div>
              <div class="profile__user-meta">
                <span class="profile__user-name">{{ user.username }}</span>
              </div>
            </div>

            <div class="profile__stats-item">
              <span class="profile__stats-value profile__stats-value--green">{{ allBets }}</span>
              <span class="profile__stats-name">Ставок сделано</span>
            </div>

            <div class="profile__stats-item">
              <span class="profile__stats-value">{{ winBets }}</span>
              <span class="profile__stats-name">Успешных</span>
            </div>
          </div>

          <ul class="profile__tabs">
            <li class="profile__tabs-item">
              <span
                  class="profile__tabs-link"
                  :class="activeTab === 'history' ? 'profile__tabs-link--active' : ''"
                  @click="activeTab = 'history'"
              >
                История игр (Сrash)
              </span>
            </li>
            <li class="profile__tabs-item">
              <span
                  class="profile__tabs-link"
                  :class="activeTab === 'history_coinflip' ? 'profile__tabs-link--active' : ''"
                  @click="activeTab = 'history_coinflip'"
              >
                История игр (Coinflip)
              </span>
            </li>
            <li class="profile__tabs-item">
              <span
                  class="profile__tabs-link"
                  :class="activeTab === 'history_wheel' ? 'profile__tabs-link--active' : ''"
                  @click="activeTab = 'history_wheel'"
              >
                История игр (Wheel)
              </span>
            </li>
          </ul>

          <div class="tabs-content">
            <div v-if="activeTab === 'history'" class="tabs-content__item">
              <HistoryBets :bets="bets" />
            </div>
            <div v-if="activeTab === 'history_coinflip'" class="tabs-content__item">
              <HistoryBetsCoinflip :bets="coinflip_bets" :user="user" />
            </div>
            <div v-if="activeTab === 'history_wheel'" class="tabs-content__item">
              <HistoryBetsWheel :bets="wheel_bets" />
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid__column grid__column--75">
        <div class="profile">
          <div class="profile__user-stats">
            <div class="profile__user-block">
              <div class="profile__user-pic-wrapper">
                <img :src="user.avatar" alt="" width="32" height="32" class="profile__user-pic">
              </div>
              <div class="profile__user-meta">
                <span class="profile__user-name">{{ user.username }}</span>
              </div>
            </div>

            <div class="profile__stats-item">
              <span class="profile__stats-value profile__stats-value--green">{{ allBets }}</span>
              <span class="profile__stats-name">Ставок сделано</span>
            </div>

            <div class="profile__stats-item">
              <span class="profile__stats-value">{{ winBets }}</span>
              <span class="profile__stats-name">Успешных</span>
            </div>
          </div>

          <ul class="profile__tabs">
            <li class="profile__tabs-item">
              <span
                  class="profile__tabs-link"
                  :class="activeTab === 'history' ? 'profile__tabs-link--active' : ''"
                  @click="activeTab = 'history'"
              >
                История игр (Сrash)
              </span>
            </li>
            <li class="profile__tabs-item">
              <span
                  class="profile__tabs-link"
                  :class="activeTab === 'history_coinflip' ? 'profile__tabs-link--active' : ''"
                  @click="activeTab = 'history_coinflip'"
              >
                История игр (Coinflip)
              </span>
            </li>
            <li class="profile__tabs-item">
              <span
                  class="profile__tabs-link"
                  :class="activeTab === 'history_wheel' ? 'profile__tabs-link--active' : ''"
                  @click="activeTab = 'history_wheel'"
              >
                История игр (Wheel)
              </span>
            </li>
          </ul>

          <div class="tabs-content">
            <div v-if="activeTab === 'history'" class="tabs-content__item">
              <HistoryBets :bets="bets" />
            </div>
            <div v-if="activeTab === 'history_coinflip'" class="tabs-content__item">
              <HistoryBetsCoinflip :bets="coinflip_bets" :user="user" />
            </div>
            <div v-if="activeTab === 'history_wheel'" class="tabs-content__item">
              <HistoryBetsWheel :bets="wheel_bets" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="$resize && $mq.below(1024)">

      </div>
      <div v-else class="grid__column grid__column--25">
        <Chatbox :online="online" />
      </div>
    </div>
  </div>
</template>
<style lang="scss" src="./Profile/Profile.scss"></style>

<script>
import HistoryBets from "@/components/HistoryBets/HistoryBets";
import HistoryBetsCoinflip from "@/components/HistoryBetsCoinflip/HistoryBetsCoinflip"
import Chatbox from '@/components/Chatbox/Chatbox.vue';
import HistoryBetsWheel from "@/components/HistoryBetsWheel/HistoryBetsWheel";

export default {
  props: ['online'],
  components: {
    HistoryBets,
    HistoryBetsCoinflip,
    HistoryBetsWheel,
    Chatbox
  },
  data() {
    return {
      user: {},
      bets: {},
      coinflip_bets: {},
      allBets: 0,
      winBets: 0,
      activeTab: 'history',
      wheel_bets: []
    }
  },
  mounted() {
    this.getUser();
  },
  watch: {
    '$route.params.id'() {
      this.getUser()
    }
  },
  methods: {
    getUser() {
      this.$root.request('GET', `/user/byId/${this.$route.params.id}`)
      .then(data => {
        this.user = data.user;
        this.bets = data.bets;
        this.allBets = data.allBets;
        this.winBets = data.winBets;
        this.coinflip_bets = data.coinflip_bets;
        this.wheel_bets = data.wheel_bets;
      }).catch(() => {
        this.$router.back();
      })
    }
  }
}
</script>