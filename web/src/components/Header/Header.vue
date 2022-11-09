<template>
  <div>
    <template v-if="$resize && $mq.below(1024)">
      <div class="header-mobile" :class="isMobileMenuOpened ? 'header-mobile--menu-opened' : ''">
        <div class="header-mobile__top">
          <a href="/" class="header-mobile__logo">
            <img alt="" src="@/assets/logo.png" class="header-mobile__logo-image">
          </a>

          <button @click="isMobileMenuOpened = !isMobileMenuOpened" class="header-mobile__trigger"></button>
        </div>

        <div v-if="isMobileMenuOpened && !$root.tech.status" class="header-mobile__body">
          <div class="header__profile header__profile--mobile">
            <template v-if="$root.user !== null">
              <div class="header-mobile__user">
                <router-link tag="img" to="/profile" :src="$root.user.avatar" alt="" class="header-mobile__user-image"></router-link>
                <div class="header-mobile__meta">
                  <div class="header-mobile__user-content">
                    <span class="header-mobile__user-name">{{ $root.user.username }}</span>
                    <span class="header-mobile__user-status header-mobile__user-status--green"></span>
                  </div>
                  <button class="button button--logout" @click="logOut">
                    <span class="icon icon--logout"></span>
                  </button>
                </div>
              </div>

              <div class="header__profile-content header__profile-content--mobile">
                <div class="header__profile-balance">
                  <span class="header__profile-balance-title header__profile-balance-title--mobile">На счету:</span>
                  <span class="header__profile-balance-value header__profile-balance-value--mobile">$ {{ $root.user.balance.toFixed(2) }}</span>
                </div>

                <button class="button button--pay button--pay-mobile" @click="$emit('openPayModal')">
                  <span class="icon icon--pay"></span> Пополнить
                </button>
              </div>

              <!--              <button class="button button&#45;&#45;logout">-->
              <!--                <span class="icon icon&#45;&#45;logout"></span>-->
              <!--              </button>-->
            </template>

            <template v-else>
              <button @click="$root.redirectToSteam" class="button button--auth">Войти через Steam<span class="icon icon--steam"></span></button>
            </template>
          </div>

          <ul class="header__menu header__menu--mobile">
            <li class="header__menu-item header__menu-item--mobile">
              <router-link to="/" class="header__menu-link header__menu-link--mobile">
                <span class="icon icon--home"></span> Crash
              </router-link>
            </li>
            <li class="header__menu-item header__menu-item--mobile">
              <router-link to="/coinflip" class="header__menu-link header__menu-link--mobile">
                <span class="icon icon--home"></span> Coinflip<span class="menu-beta">BETA</span>
              </router-link>
            </li>
            <li class="header__menu-item header__menu-item--mobile">
              <router-link to="/wheel" class="header__menu-link header__menu-link--mobile">
                <span class="icon icon--home"></span> Wheel<span class="menu-beta">BETA</span>
              </router-link>
            </li>
            <li class="header__menu-item header__menu-item--mobile">
              <router-link tag="a" :to="{name: 'Profile', query: { to: 'withdraws' }}" class="header__menu-link header__menu-link--mobile">
                <span class="icon icon--history"></span> История выводов
              </router-link>
            </li>
            <li class="header__menu-item header__menu-item--mobile">
              <router-link to="/support" class="header__menu-link header__menu-link--mobile">
                <span class="icon icon--support"></span> Поддержка
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="header">
        <div class="grid">
          <div class="grid__column grid__column--25">
            <router-link tag="a" to="/" class="header__logo">
              <img alt="" src="@/assets/logo.png" class="header__logo-image">
            </router-link>
          </div>

          <div class="grid__column grid__column--50" v-if="!$root.tech.status">
            <div class="header__middle-content">
              <ul class="header__menu">
                <li class="header__menu-item">
                  <router-link to="/" class="header__menu-link">
                    <span class="icon icon--home"></span> Crash
                  </router-link>
                </li>
                <li class="header__menu-item">
                  <router-link to="/coinflip" class="header__menu-link">
                    <span class="icon icon--home"></span> Coinflip<span class="menu-beta">BETA</span>
                  </router-link>
                </li>
                <li class="header__menu-item">
                  <router-link to="/wheel" class="header__menu-link">
                    <span class="icon icon--home"></span> Wheel<span class="menu-beta">BETA</span>
                  </router-link>
                </li>
                <li class="header__menu-item">
                  <router-link tag="a" :to="{name: 'Profile', query: { to: 'withdraws' }}" class="header__menu-link">
                    <span class="icon icon--history"></span> {{ $t('header.history_withdraw') }}
                  </router-link>
                </li>
                <li class="header__menu-item">
                  <router-link to="/support" class="header__menu-link">
                    <span class="icon icon--support"></span> {{ $t('header.support') }}
                  </router-link>
                </li>
              </ul>

              <div class="header__socials-meta">
                <ul class="header__socials">
                  <li class="header__socials-item">
                    <a :href="$root.config.vk_group" class="header__socials-link header__socials-link--vk"></a>
                  </li>
                </ul>
                <button v-if="$root.lang === 'RU'" @click="setLang('ENG')" class="button">Русский</button>
                <button v-if="$root.lang === 'ENG'" @click="setLang('RU')" class="button">Английский</button>
              </div>
            </div>
          </div>

          <div class="grid__column grid__column--25" v-if="!$root.tech.status">
            <div class="header__profile">
              <template v-if="$root.user !== null">
                <div class="header__profile-content">
                  <router-link to="/profile" class="header__profile-user">
                    <img :src="$root.user.avatar" alt="" class="header__profile-user-pic">
                  </router-link>

                  <div class="header__profile-balance">
                    <span class="header__profile-balance-title">{{ $t('header.on_account') }}:</span>
                    <span class="header__profile-balance-value">$ {{ $root.user.balance.toFixed(2) }}</span>
                  </div>

                  <button class="button button--pay" @click="$emit('openPayModal')">
                    <span class="icon icon--pay"></span> {{ $t('header.deposit') }}
                  </button>
                </div>

                <button class="button button--logout" @click="logOut">
                  <span class="icon icon--logout"></span>
                </button>
              </template>

              <template v-else>
                <button class="button button--auth" @click="$root.redirectToSteam">
                  {{ $t('header.logIn') }}<span class="icon icon--steam"></span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="js" src="./Header.js"></script>
<style lang="scss" src="./Header.scss"></style>