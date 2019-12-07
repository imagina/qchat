<template>
  <div class="relative-position">
    <div class="row q-mx-md q-my-md" style="min-height: 62vh" v-if="conversation.users.length > 0">
      <div class="col-12">
        <q-scroll-area style="height:100%">
          <q-btn icon="keyboard_arrow_up" round @click="loadMoreMessage()">
            <q-tooltip>
              Load More
            </q-tooltip>
          </q-btn>
          <div
            v-for="(message, index) in conversation.messages"
            :key="index">
            <q-chat-message
              bg-color="blue"
              text-color="white"
              :name="isSendMessage(message) ? 'me' : message.user.fullName"
              :avatar="getUrlImg(message.user.mainImage)"
              :text="[message.body]"
              :stamp="$trd(message.createdAt,{type: 'long'})"
              :sent="isSendMessage(message)"materi
            />
          </div>
        </q-scroll-area>
      </div>
    </div>
    <div v-else>
      <q-toolbar color="grey-4">
        <q-toolbar-title class="text-primary"/>
      </q-toolbar>
      <div class="row q-mx-md q-my-md" style="min-height: 790px">
        <div class="col-md-12">
          <not-found
                  class="absolute-center"
                  label=" "
                  :showButton="false"/>
        </div>
      </div>
    </div>
    <inner-loading :visible="loading" />
  </div>
</template>

<script>
  import { Picker } from 'emoji-mart-vue'
  export default {
    components:{
      Picker,
    },
    props:{
      id:{
        required: true,
      }
    },
    data () {
      return {
        loading: false,
        paginate:{
          page: 1,
          take: 20,
          lastPage:0,
        },
        conversation: {
          users: [],
          messages: []
        },
        messages: [],
        form:{
          body: '',
          userId: this.$store.state.quserAuth.userId,
          conversationId: this.$route.params.id,
        },
        showEmoji: false,
      }
    },
    mounted(){
      this.initPusher()
      this.initConversation()
    },
    watch:{
      id: function ( val ) {
        this.initConversation()
      },
      messages: function (val) {
        //this.updateConversation()
      }
    },
    computed:{
      users (){
        return this.conversation.users.filter( user => {
          return user.id !== this.$store.state.quserAuth.userId
        })
      },
    },
    methods:{
      initPusher(){
        this.echo = new Echo({
          broadcaster: env('BROADCAST_DRIVER', 'pusher'),
          key: env('PUSHER_APP_KEY'),
          cluster: env('PUSHER_APP_CLUSTER'),
          encrypted: env('PUSHER_APP_ENCRYPTED'),
        })
        this.echo.channel('global')
          .listen(`.conversationsUserUpdated${this.$store.state.quserAuth.userData.id}`, response => {
            this.getConversation(true)
            console.warn(response.message.conversationId)
            if(this.$route.params.id == response.message.conversationId){
              this.$root.$emit('newMessage', response.message)
            }
          })
      },
      initConversation(){
        this.getConversation( true )
        this.getMessagesPaginated(true)
        this.form.userId = this.$store.state.quserAuth.userId
        this.form.conversationId = this.id
        this.messages = []
      },
      getConversation(refresh = false){
        this.loading = true
        let params = {
          refresh: refresh,
          params: {
            include: 'messages,users'
          }
        }
        let criteria = this.id
        this.$crud.show('apiRoutes.qchat.conversations', criteria, params)
          .then( response => {
            this.conversation = response.data
            this.loading = false
          })
          .catch( error => {
            this.loading = false
          })
      },
      getMessagesPaginated(refresh = false){
        this.loading = true
        let params = {
          refresh: refresh,
          params: {
            filter:{
              conversation: this.id,
              order:{
               field: 'created_at',
               way: 'desc'
              }
            },
            page: this.paginate.page,
            take: this.paginate.take,
          }
        }
        this.$crud.index('apiRoutes.qchat.messages', params)
        .then( response => {
          //this.messages = response.data.reverse()
          this.paginate.lastPage = response.meta.page.lastPage
          response.data.forEach(item => {
            this.messages.unshift(item)
          })
          this.loading = false
        })
        .catch( error => {
          this.loading = false
        })
      },
      loadMoreMessage(){
        if (this.paginate.page < this.paginate.lastPage){
          this.paginate.page++
          this.getMessagesPaginated(true)
        }
      },
      getUrlImg(uri){
        if(uri.lastIndexOf('http')>-1) {
          return uri
        }else{
          return `${config('apiRoutes.api.base_url')}/${uri}`
        }
      },
      isSendMessage(message){
        return message.userId == this.$store.state.quserAuth.userId ? true : false
      },
      onInput( event ){
        if( !event ){
          return false
        }
        if( !this.form.body ){
          this.form.body = event.native
        }else{
          this.form.body = this.form.body + event.native
        }
        this.showEmoji = false
      },
    }
  }
</script>

<style scoped>
</style>
