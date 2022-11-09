<template>
  <div>

  </div>
</template>

<script>
export default {
  created() {
    if (typeof this.$route.params.ref !== 'undefined') {
      this.$cookie.set('ref', this.$route.params.ref, { expires: '1Y' })
    }

    this.$router.push({name: 'Home'});
  }
}
</script>