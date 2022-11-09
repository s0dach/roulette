<template>
  <div class="index-layout" v-if="user !== null">
    <div class="grid">
      <div class="grid__column grid__column--75 grid__column--profile">
        <div class="profile">
          <div class="profile__user-stats">
            <div class="profile__user-block">
              <div class="profile__user-pic-wrapper">
                <img :src="user.avatar" alt="" width="32" height="32" class="profile__user-pic">
              </div>
              <div class="profile__user-meta">
                <span class="profile__user-name">{{ user.username }}</span>
<!--                <span class="profile__user-status profile__user-status&#45;&#45;green">Играет</span>-->
              </div>
            </div>
            
            <div class="profile__stats-item profile__stats-item--bets">
              <span class="profile__stats-value profile__stats-value--green">{{ allBets }}</span>
              <span class="profile__stats-name">Ставок сделано</span>
            </div>

            <div class="profile__stats-item profile__stats-item--mobile-hide">
              <span class="profile__stats-value">{{ winBets }}</span>
              <span class="profile__stats-name">Успешных</span>
            </div>
          </div>

          <div class="profile__layout">
            <div class="profile__layout-side">
              <div class="profile__widget">
                <div class="profile__widget-header">
                  <span class="profile__widget-name">Промо-код <span class="icon icon--qr"></span></span>
                  <router-link tag="a" :to="{name: 'Support'}" class="profile__widget-header-link">Где его взять?</router-link>
                </div>

                <div class="profile__widget-body">
                  <div class="profile__promo-text">
                    <p>
                      Активируйте свой <span class="profile__gold">промокод</span> и получите<br>
                      приятный <span class="profile__gold">бонус</span>
                    </p>
                  </div>

                  <form class="profile__form-promo" onclick="return false;">
                    <input type="text" class="profile__promo-input" v-model="promocode" placeholder="XXXXXX">

                    <button class="button button--promo-submit" @click="usePromocode">Активировать</button>
                  </form>

                </div>
              </div>
            </div>
            
            <div class="profile__layout-main">
              <div class="profile__widget">
                <div class="profile__widget-header">
                  <span class="profile__widget-name">Ссылка на обмен <span class="icon icon--exchange-gold"></span></span>
                  <a target="_blank" :href="`https://steamcommunity.com/profiles/${user.steamid}/tradeoffers/privacy`" class="profile__widget-header-link">Где её взять?</a>
                </div>

                <div class="profile__widget-body">
                  <form class="profile__form" onclick="return false;">
                    <div class="profile__input-text-wrapper">
                      <input v-model="user.trade_url" type="text" class="profile__text-input profile__text-input--exchange-link" placeholder="Введите вашу ссылку на обмен">
                    </div>
                    <button class="button button--save-exchange" @click="saveTradeUrl">Сохранить</button>
                  </form>
                </div>
              </div>

              <div class="profile__widget">
                <div class="profile__widget-header">
                  <span class="profile__widget-name">Реферальная система <span class="icon icon--referral"></span></span>
                  <router-link tag="a" :to="{name: 'Support'}" class="profile__widget-header-link">Как это устроено?</router-link>
                </div>

                <div class="profile__widget-body">
                  <form class="profile__form profile__form--stats">
                    <div class="profile__input-text-wrapper profile__input-text-wrapper--referral-link">
                      <input ref="refLinkRef" :value="domain + '/r/' + user.referral_code" type="text" class="profile__text-input profile__text-input--referral-link" value="Тут реферальная ссылка" readonly @click="makeTextSelection">
                      <span class="icon icon--input-link"></span>
                    </div>
                    <div class="profile__stats-item profile__stats-item--mini-margin">
                      <span class="profile__stats-value">{{ referrals }}</span>
                      <span class="profile__stats-name">Рефералов</span>
                    </div>
                    <div class="profile__stats-item profile__stats-item--mini-margin">
                      <span class="profile__stats-value profile__stats-value--gold">{{ $root.config.percent_referral }}%</span>
                      <span class="profile__stats-name">Процент</span>
                    </div>
                    <div class="profile__stats-item profile__stats-item--mini-margin">
                      <span class="profile__stats-value profile__stats-value--green">$ {{ user.referral_sum.toFixed(2) }}</span>
                      <span class="profile__stats-name">Прибыль</span>
                    </div>
                  </form>
                </div>
              </div>
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
            <li class="profile__tabs-item">
              <span
                class="profile__tabs-link"
                :class="activeTab === 'withdraw' ? 'profile__tabs-link--active' : ''"
                @click="activeTab = 'withdraw'"
              >
                Выводы
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
            <div v-if="activeTab === 'withdraw'" class="tabs-content__item">
              <Withdraws :withdraws="withdraws" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid__column grid__column--25 grid__column--side-right grid__column--chat">
        <Chatbox :online="online" />
      </div>
    </div>
  </div>
</template>
<style lang="scss" src="./Profile.scss"></style>

<script lang="js">
import Chatbox from '@/components/Chatbox/Chatbox.vue';
import HistoryBets from "@/components/HistoryBets/HistoryBets";
import Withdraws from "@/components/Withdraws/Withdraws";
import HistoryBetsCoinflip from "@/components/HistoryBetsCoinflip/HistoryBetsCoinflip"
import HistoryBetsWheel from "@/components/HistoryBetsWheel/HistoryBetsWheel";

export default {
  name: 'Home',
  props: ['online'],
  components: {
    HistoryBetsCoinflip,
    Chatbox,
    HistoryBets,
    Withdraws,
    HistoryBetsWheel
  },
  data() {
    return {
      activeTab: "history",
      user: null,
      bets: [],
      coinflip_bets: [],
      wheel_bets: [],
      referrals: 0,
      withdraws: [],
      domain: '',
      promocode: '',
      allBets: 0,
      winBets: 0
    }
  },
  mounted() {
    this.domain = window.location.protocol + '//' + window.location.hostname;

    this.getProfile();

    if (typeof this.$route.query.to !== 'undefined') {
      if (this.$route.query.to === 'withdraws') {
        this.activeTab = 'withdraw';
      }
    }
  },
  methods: {
    makeTextSelection(event) {
      event.target.select();
      const el = this.$refs['refLinkRef'];
      el.select();
      document.execCommand('copy');

      this.$root.showNotify('success', 'Реферальная ссылка скопирована в буфер обмена.');
    },
    getProfile() {
      this.$root.request('GET', '/user/myProfile')
          .then(data => {
            this.user = data.user;
            this.bets = data.bets;
            this.referrals = data.referrals;
            this.withdraws = data.withdraws;
            this.allBets = data.allBets;
            this.winBets = data.winBets;
            this.coinflip_bets = data.coinflip_bets;
            this.wheel_bets = data.wheel_bets;

            if (this.user.trade_url === null || this.user.trade_url === "null") {
              this.user.trade_url = '';
            }
          })
          .catch(() => {
            this.$router.push({ name: 'Home' });
          });
    },
    saveTradeUrl() {
      this.$root.request('POST', '/user/setTradeUrl', {
        trade_url: this.user.trade_url
      }).then(() => {
        this.$root.showNotify('success', 'Ссылка обновлена');
      }).catch(err => {
        this.$root.showNotify('error', err);
      })
    },
    usePromocode() {
      this.$root.request('POST', '/promocode/use', {
        code: this.promocode
      }).then((data) => {
        this.promocode = ''
        this.$root.showNotify('success', `Промокод активирован на сумму ${data.sum.toFixed(2)}$`);
        this.$root.getUser();
      }).catch(err => {
        this.$root.showNotify('error', err);
      })
    }
  }
}
</script>