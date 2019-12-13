<template>
  <div>
    <q-btn
      color="primary"
      @click="openModal = true"
      class="full-width"
      icon="fas fa-plus-circle"/>
    <q-list no-border>
      <labelConversation
        :conversationUser="conversation"
        v-for="(conversation, index) in table.data"
        :key="index"/>
    </q-list>
    <newConversation
      :open="openModal"
      @updateConversations="getDataTable(true)"
      @closeModal="openModal = false"/>
  </div>
</template>

<script>
  import newConversation from '@imagina/qchat/_components/admin/newConversation'
  import labelConversation from '@imagina/qchat/_components/admin/labelConversation'
  import Echo from "laravel-echo";
  export default {
    components:{
      labelConversation,
      newConversation
    },
    data() {
      return {
        openModal:false,
        loading: false,
        table: {
          data: [],
          pagination: {
            page: 1,
            rowsNumber: '',
            rowsPerPage: 10
          },
          filter: {
            search: null
          }
        },
        echo: null
      }
    },
    created() {
      this.$nextTick(function () {
        this.getDataTable()
        this.initPusher()
      })
    },
    methods:{
      getDataTable(refresh = false) {
        this.getData({pagination: this.table.pagination}, refresh)
      },
      getData({pagination, filter}, refresh = false) {
        this.loading = true
        //Params to request
        let params = {
          refresh: refresh,
          params: {
            filter: this.table.filter,
            include: 'conversationsusers'
          }
        }
        //Request
        let criteria = this.$store.state.quserAuth.userId
        this.$crud.show('apiRoutes.qchat.users', criteria, params)
        .then(response => {
          this.table.data  = response.data.conversationsusers
          this.$store.dispatch(
            'qchatConversation/setConversationsUsers',
            response.data.conversationsusers
          )
          this.loading = false
        })
        .catch(error => {
          this.loading = false
        })
      },
      initPusher(){
        this.echo = new Echo({
          broadcaster: env('BROADCAST_DRIVER', 'pusher'),
          key: env('PUSHER_APP_KEY'),
          cluster: env('PUSHER_APP_CLUSTER'),
          encrypted: env('PUSHER_APP_ENCRYPTED'),
        })
        this.echo.channel('global')
          .listen(`.conversationsUserUpdated${this.$store.state.quserAuth.userData.id}`, response => {
            this.getDataTable(true)
            console.warn(response.message.conversationId)
            if(this.$route.params.id == response.message.conversationId){
              this.$root.$emit('newMessage', response.message)
            }
          })
      },
    }
  }
</script>

<style scoped>

</style>
