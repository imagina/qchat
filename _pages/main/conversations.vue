<template>
  <div id="conversationsPage">
    <!--Chat-->
    <advanced-chat height="calc(100vh - 200px)" allow-create-chat allow-providers/>
  </div>
</template>
<script>
//Components
import advancedChat from '@imagina/qchat/_components/advancedChat'

export default {
  beforeDestroy() {
    this.$root.$off('page.data.refresh')
  },
  props: {},
  components: {advancedChat},
  watch: {},
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      loading: false,
      data: []
    }
  },
  computed: {},
  methods: {
    init() {
      //this.getData()
      //this.$root.$on('page.data.refresh', () => this.getData(true))
    },
    //Get data
    getData(refresh = false) {
      return new Promise((resolve, reject) => {
        this.loading = true
        //Requets params
        let requestParams = {
          refresh: refresh
        }
        //Request
        this.$crud.index('apiRoutes', requestParams).then(response => {
          this.data = response.data
          this.loading = false
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
            this.loading = false
          })
        })
      })
    }
  }
}
</script>
<style lang="stylus">
#conversationsPage
  border 2px solid $grey-3
  border-radius $custom-radius
  overflow hidden
</style>
