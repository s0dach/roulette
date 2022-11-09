<template>
  <div>
    <div class="kt-subheader kt-grid__item" id="kt_subheader">
      <div class="kt-subheader__main">
        <h3 class="kt-subheader__title">Статистика</h3>
      </div>
    </div>

    <div class="kt-content  kt-grid__item kt-grid__item--fluid" id="kt_content">
      <div class="kt-portlet">
        <div class="kt-portlet__body  kt-portlet__body--fit">
          <div class="row row-no-padding row-col-separator-xl">
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Пополнений на
                    </h4>
                    <span class="kt-widget24__desc">за сегодня</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.payments.daily }}<i class="la la-usd"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Пополнений на
                    </h4>
                    <span class="kt-widget24__desc">за неделю</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.payments.weekly }}<i class="la la-usd"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Пополнений на
                    </h4>
                    <span class="kt-widget24__desc">за месяц</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.payments.monthly }}<i class="la la-usd"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Пополнений на
                    </h4>
                    <span class="kt-widget24__desc">за все время</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.payments.all }}<i class="la la-usd"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="kt-portlet">
        <div class="kt-portlet__body  kt-portlet__body--fit">
          <div class="row row-no-padding row-col-separator-xl">
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Выводов на
                    </h4>
                    <span class="kt-widget24__desc">за сегодня</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.withdraws.daily }}<i class="la la-usd"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Выводов на
                    </h4>
                    <span class="kt-widget24__desc">за неделю</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.withdraws.weekly }}<i class="la la-usd"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Выводов на
                    </h4>
                    <span class="kt-widget24__desc">за месяц</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.withdraws.monthly }}<i class="la la-usd"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Выводов на
                    </h4>
                    <span class="kt-widget24__desc">за все время</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.withdraws.all }}<i class="la la-usd"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="kt-portlet">
        <div class="kt-portlet__body  kt-portlet__body--fit">
          <div class="row row-no-padding row-col-separator-xl">
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Пользователей
                    </h4>
                    <span class="kt-widget24__desc">за сегодня</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.users.daily }}<i class="la la-user"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Пользователей
                    </h4>
                    <span class="kt-widget24__desc">за неделю</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.users.weekly }}<i class="la la-user"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Пользователей
                    </h4>
                    <span class="kt-widget24__desc">за месяц</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.users.monthly }}<i class="la la-user"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Пользователей
                    </h4>
                    <span class="kt-widget24__desc">за все время</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.users.all }}<i class="la la-user"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="kt-portlet">
        <div class="kt-portlet__body  kt-portlet__body--fit">
          <div class="row row-no-padding row-col-separator-xl">
            <div class="col-md-12">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Профит crash
                    </h4>
                    <span class="kt-widget24__desc">за все время</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.profit.toFixed(2) }}<i class="la la-dollar"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="kt-portlet">
        <div class="kt-portlet__body  kt-portlet__body--fit">
          <div class="row row-no-padding row-col-separator-xl">
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Игр coinflip
                    </h4>
                    <span class="kt-widget24__desc">за сегодня</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.coinflips.daily }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Игр coinflip
                    </h4>
                    <span class="kt-widget24__desc">за неделю</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.coinflips.weekly }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Игр coinflip
                    </h4>
                    <span class="kt-widget24__desc">за месяц</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.coinflips.monthly }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Игр coinflip
                    </h4>
                    <span class="kt-widget24__desc">за все время</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.coinflips.all }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="kt-portlet">
        <div class="kt-portlet__body  kt-portlet__body--fit">
          <div class="row row-no-padding row-col-separator-xl">
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Профит coinflip
                    </h4>
                    <span class="kt-widget24__desc">за сегодня</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.coinflip_profit.daily.toFixed(2) }} $
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Профит coinflip
                    </h4>
                    <span class="kt-widget24__desc">за неделю</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.coinflip_profit.weekly.toFixed(2) }} $
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Профит coinflip
                    </h4>
                    <span class="kt-widget24__desc">за месяц</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.coinflip_profit.monthly.toFixed(2) }} $
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-3">
              <div class="kt-widget24">
                <div class="kt-widget24__details">
                  <div class="kt-widget24__info">
                    <h4 class="kt-widget24__title">
                      Профит coinflip
                    </h4>
                    <span class="kt-widget24__desc">за все время</span>
                  </div>

                  <span class="kt-widget24__stats kt-font-success">
                    {{ statistic.coinflip_profit.all.toFixed(2) }} $
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-xl-4">
          <div class="kt-portlet">
            <div class="kt-portlet__head">
              <div class="kt-portlet__head-label">
                <h3 class="kt-portlet__head-title">
                  Последние пользователи
                </h3>
              </div>
            </div>
            <div class="kt-portlet__body">
              <div class="kt-widget3 kt-scroll" data-scroll="true" data-height="616">

                <div v-for="user in statistic.usersRegistrations" :key="user.id" class="kt-widget3__item">
                  <div class="kt-widget3__header">
                    <div class="kt-widget3__user-img">
                      <img class="kt-widget3__img" :src="user.avatar" alt="">
                    </div>
                    <div class="kt-widget3__info">
                      <router-link tag="a" :to="{name: 'user', params: {id: user.id}}"
                                   class="kt-widget3__username">
                        {{ user.username }}
                      </router-link>
                      <br>
                    </div>
                    <span class="kt-widget3__status kt-font-success">
                      {{ user.created_at }}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-4">
          <div class="kt-portlet">
            <div class="kt-portlet__head">
              <div class="kt-portlet__head-label">
                <h3 class="kt-portlet__head-title">
                  Последние пополнения
                </h3>
              </div>
            </div>
            <div class="kt-portlet__body">
              <div class="kt-widget3 kt-scroll" data-scroll="true" data-height="616">
                <div v-for="payment in statistic.lastPayments" :key="payment.id" class="kt-widget3__item">
                  <div class="kt-widget3__header">
                    <div class="kt-widget3__user-img">
                      <img class="kt-widget3__img" :src="payment.avatar" alt="">
                    </div>
                    <div class="kt-widget3__info">
                      <router-link tag="a" :to="{name: 'user', params: {id: payment.user_id}}"
                                   class="kt-widget3__username">
                        {{ payment.username }}
                      </router-link>
                      <br>
                    </div>
                    <span class="kt-widget3__status kt-font-success">
                      {{ payment.sum.toFixed(2) }} $
                    </span>
                    <span class="kt-widget3__status kt-font-success">
                      {{ payment.created_at }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-4">
          <div class="kt-portlet">
            <div class="kt-portlet__head">
              <div class="kt-portlet__head-label">
                <h3 class="kt-portlet__head-title">
                  Последние выводы
                </h3>
              </div>
            </div>
            <div class="kt-portlet__body">
              <div class="kt-widget3 kt-scroll" data-scroll="true" data-height="616">

                <div v-for="withdraw in statistic.lastWithdraws" :key="withdraw.id" class="kt-widget3__item">
                  <div class="kt-widget3__header">
                    <router-link tag="div" style="cursor: pointer" :to="{name: 'user', params: {id: withdraw.user.id}}" class="kt-widget3__user-img">
                      <img class="kt-widget3__img" :src="withdraw.user.avatar" alt="">
                    </router-link>
                    <div class="kt-widget3__info" style="margin-left: 50px;">
                      <span class="kt-widget3__username">
                        {{ withdraw.item.market_hash_name }}
                      </span>
                      <br>
                    </div>
                    <span class="kt-widget3__status kt-font-success">
                      {{ withdraw.created_at }}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      statistic: {
        payments: {
          daily: 0.00,
          weekly: 0.00,
          monthly: 0.00,
          all: 0.00
        },
        withdraws: {
          daily: 0.00,
          weekly: 0.00,
          monthly: 0.00,
          all: 0.00
        },
        users: {
          daily: 0.00,
          weekly: 0.00,
          monthly: 0.00,
          all: 0.00
        },
        profit: 0.00,
        usersRegistrations: {},
        lastWithdraws: {},
        lastPayments: {},
        profits: {
          daily: 0.00,
          weekly: 0.00,
          monthly: 0.00,
          all: 0.00
        }
      }
    }
  },
  created() {
    this.loadStatistic()
  },
  methods: {
    loadStatistic() {
      this.$root.request('GET', '/admin/statistic')
        .then((data) => {
          this.statistic = data.statistic
        })
    }
  }
}
</script>