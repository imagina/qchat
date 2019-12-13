<template>
  <q-item
    :to="goTo()"
    link
    exact>
    <q-item-main>
      <q-item-tile label>
        <q-chip
          v-for="( user, index ) in users"
          :key="index"
          :avatar="getUrlImg( user.smallImage )">
          {{user.fullName}}
        </q-chip>
      </q-item-tile>
    </q-item-main>
    <q-item-side right>
      <q-icon
        name="chat_bubble"
        dense
        flat
        :color="`${conversationUser.lastMessageReaded ? 'green' : ''}`"
        round>
      </q-icon>
    </q-item-side>
    <q-inner-loading :visible="loading">
      <q-spinner-facebook size="17px" color="primary"/>
    </q-inner-loading>
  </q-item>
</template>

<script>
  export default {
    components: {},
    props: {
      conversationUser:{
        type: Object,
        required: true,
      },
    },
    data(){
     return{
       loading: false,
       conversation: {
         users: []
       },
     }
    },
    computed:{
      users (){
        return this.conversation.users.filter( user => {
          return user.id != this.$store.state.quserAuth.userId
        })
      }
    },
    mounted(){
      this.getConversation( true )
    },
    methods:{
      getConversation( refresh = false ){
        this.loading = true
        let params = {
          refresh: refresh,
          params: {
            include: 'users'
          }
        }
        this.$crud.show( 'apiRoutes.qchat.conversations', this.conversationUser.conversationId, params )
        .then( response => {
          this.conversation = response.data
          this.loading = false
        })
        .catch( error => {
          this.loading = false
        })
      },
      getUrlImg( uri ){
        return `${config('apiRoutes.api.base_url')}/${uri}`
      },
      goTo(){
        return{
          name: 'qchat.admin.conversation.show',
          params: {
            id: this.conversationUser.conversationId
          }
        }
      },
    }
  }
</script>

<style scoped>

</style>
