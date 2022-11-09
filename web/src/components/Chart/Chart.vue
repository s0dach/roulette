<template>
  <!-- chart chart--red widget красит все эдменты в красный -->
  <div class="chart widget" :class="[game.status === 'crashed' ? 'chart--red' : 'chart--yellow']">
    <svg v-if="game.status !== 'timer' && !isMobile" data-graph-circle="2" width="20" height="20"
         viewBox="0 0 20 20"
         class="graph-svg__circle graph-svg__circle-2" :class="[isMobile ? 'graph-svg__circle-2__mobile' : '']"
         :style="'transform: translateY(-' + graph.circle + 'px);'">
      <circle class="graph-point-big" cx="10" cy="10" r="10" fill="rgba(0, 129, 236, 0.2)"></circle>
      <circle class="graph-point-small" cx="10" cy="10" r="5" fill="rgb(0, 129, 236)"></circle>
    </svg>

    <svg v-if="game.status !== 'timer' && isMobile" data-graph-circle="2" width="20" height="20"
         viewBox="0 0 20 20"
         class="graph-svg__circle graph-svg__circle-2" :class="[isMobile ? 'graph-svg__circle-2__mobile' : '']"
         :style="'transform: translateY(-' + graph.circle_m + 'px);'">
      <circle class="graph-point-big" cx="10" cy="10" r="10" fill="rgba(0, 193, 255, 0.2)"></circle>
      <circle class="graph-point-small" cx="10" cy="10" r="5" fill="rgb(0, 113, 231)"></circle>
    </svg>

    <svg v-if="game.status !== 'timer'" class="graph-svg__main"
         xmlns="http://www.w3.org/2000/svg" width="325" height="184"
         viewBox="0 0 325 184">
      <defs>
        <linearGradient id="progress-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(68,121,251,.9)"></stop>
          <stop offset="100%" stop-color="rgba(68,121,251,0)"></stop>
        </linearGradient>
        <linearGradient id="finish-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(211,46,65,.9)"></stop>
          <stop offset="100%" stop-color="rgba(211,46,65,0)"></stop>
        </linearGradient>
      </defs>
      <path v-if="!isMobile && game.status !== 'timer'" stroke="#dbb14d" stroke-width="3px" fill="none"
            :d="'M65,168 C226, ' + (168 - graph.a) + ' 168, ' + (168 - graph.b) + ' 325,' + (168 - graph.c)"></path>
      <path v-if="isMobile && game.status !== 'timer'" stroke="#dbb14d" stroke-width="3px" fill="none"
            :d="'M45,168 C226, ' + (168 - graph.a) + ' 168, ' + (168 - graph.b) + ' 325,' + (168 - graph.c_m)"></path>
    </svg>

    <div class="chart__lines-group">
      <div
          v-for="(multiplier, key) in graph.multipliers"
          :key="key"
          :class="['chart__line chart__line--' + (key + 1)]"
      >
        <span class="chart__line-value" :class="[(game.multiplier >= multiplier && game.status !== 'timer') ? 'chart__line-value--active' : '']">{{
            multiplier.toFixed(2)
          }}x</span>
      </div>
    </div>
    <span class="chart__top-value" v-if="game.status === 'timer'">{{ game.time.toFixed(2) }}с.</span>
    <span class="chart__top-value" v-else>{{ game.multiplier.toFixed(2) }}x</span>
  </div>
</template>

<script>
export default {
  props: ['game', 'graph', 'isMobile'],
  data() {
    return {
      lastGlassAnimate: 0
    }
  },
}
</script>

<style lang="scss" src="./Chart.scss"></style>