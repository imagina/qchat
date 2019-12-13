<template>
  <div>
    <q-page v-if="conversation.users.length > 0">
      <q-toolbar color="grey-4">
        <q-toolbar-title class="text-primary">
          <q-chip
            small
            :avatar="getUrlImg(user.smallImage)"
            v-for="(user, index) in users"
            :key="index">
            {{user.fullName}}
          </q-chip>
        </q-toolbar-title>
      </q-toolbar>
      <div class="row q-mx-md q-my-md" style="min-height: 690px">
        <div class="col-md-12">
          <q-scroll-area :style="`height: ${(heightView)}px`">
            <q-btn label="Load More" @click="loadMoreMessage()" />
            <div
              v-for="(message, index) in messages"
              :key="index">
              <q-chat-message
                bg-color="blue"
                text-color="white"
                :name="isSendMessage(message) ? 'me' : message.user.fullName"
                :avatar="getUrlImg(message.user.mainImage)"
                :text="[message.body]"
                :stamp="$trd(message.createdAt)"
                :sent="isSendMessage(message)"/>
            </div>
          </q-scroll-area>
        </div>
        <div class="col-md-12 absolute-bottom">
          <div class="relative-position">
            <picker
              native
              v-if="showEmoji"
              set="emojione"
              @select="onInput"
              class="absolute-bottom-left" />
          </div>
          <q-input
            :readonly="loading"
            :before="[{icon: 'insert_emoticon',handler(){showEmoji = !showEmoji}}]"
            @keyup.enter="sendMessage()"
            placeholder="Type Message ... "
            v-model="form.body"
            :after="[{icon: 'send', handler (){sendMessage()}}]"/>
        </div>
      </div>
      <inner-loading :visible="loading"/>
    </q-page>
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
  </div>
</template>

<script>
  import { Picker } from 'emoji-mart-vue'
  export default {
    components:{
      Picker,
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
    watch:{
      '$route.params.id': function ( val ) {
        if (this.$route.params.id != undefined){
          this.getConversation( true )
          this.getMessagesPaginated(true)
          this.form.userId = this.$store.state.quserAuth.userId
          this.form.conversationId = this.$route.params.id
          this.messages = []
        }
      },
      $route: function ( val ) {
        this.messages = []
        this.conversation.users = []
      },
      messages: function (val) {
        if (this.$route.params.id != undefined){
          this.updateConversation()
        }
      }
    },
    computed:{
      users (){
        return this.conversation.users.filter( user => {
          return user.id !== this.$store.state.quserAuth.userId
        })
      },
      lastMessage () {
        let lastIndex = this.conversation.messages.length-1
        if ( lastIndex == -1 ){
          return {
            id: null
          }
        }
        return this.conversation.messages[this.conversation.messages.length-1]
      },
      heightView() {
        return  (document.body.clientHeight / 100 ) * 82
      }
    },
    created() {
      this.messages = []
      if (this.$route.params.id != undefined){
        this.getConversation(true)
        this.getMessagesPaginated(true)
        this.$root.$on("newMessage", message => {
          this.messages.push(message)
        });
      }
    },
    methods:{
      getConversation(refresh = false){
        this.loading = true
        let params = {
          refresh: refresh,
          params: {
            include: 'messages,users'
          }
        }
        let criteria = this.$route.params.id
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
              conversation: this.$route.params.id,
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
        return `${config('apiRoutes.api.base_url')}/${uri}`
      },
      isSendMessage(message){
        return message.userId == this.$store.state.quserAuth.userId ? true : false
      },
      updateConversation() {
        this.loading = true
        let conversationsUsers = this.$store.getters['qchatConversation/getConversationsUsers']
          .find(item => {
            return item.conversationId == this.$route.params.id
          })
        let params = {params: {}};
        if(conversationsUsers){
          if('lastMessageReaded' in conversationsUsers){
            if (parseInt(conversationsUsers.lastMessageReaded) != null) {
              conversationsUsers.lastMessageReaded = null
              this.$crud.update('apiRoutes.qchat.conversationUser', conversationsUsers.id, conversationsUsers, params)
              .then(response => {
                this.loading = false
              }).catch(error => {
                this.loading = false
              });
            }//if (parseInt(conversationsUsers.lastMessageReaded) != null) {
          }
        }
      },
      sendMessage(){
        if (this.form.body != ''){
          this.loading = true
          this.$crud.create('apiRoutes.qchat.messages', this.form)
          .then( response => {
            this.form.body = ''
            this.messages.push(response.data)
            this.loading = false
          })
          .catch( error => {
            this.loading = false
          })
        }
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
