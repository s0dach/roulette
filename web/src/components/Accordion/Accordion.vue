<template>
  <div class="accordion">
    <div v-for="(item, index) in faqData" class="accordion__item">
      <h3
        @click="toggleAccordionItem(index)"
        class="accordion__title"
        :class="item.isActive ? 'accordion__title--active' : ''">
        {{ item.header }}
      </h3>
      <transition name="slide-fade">
        <div v-show="item.isActive" class="accordion__text" v-html="item.text"></div>
      </transition>
    </div>
  </div>
</template>

<script lang="js">
export default {
  props: {
    faqData: Array
  },
  methods: {
    toggleAccordionItem(index) {
      if (typeof this.faqData[index].isActive === "undefined") {
        this.faqData[index].isActive = false;
      }
      this.faqData[index].isActive = !this.faqData[index].isActive;
      this.$forceUpdate();
    }
  }
}
</script>

<style lang="scss" src="./Accordion.scss"></style>