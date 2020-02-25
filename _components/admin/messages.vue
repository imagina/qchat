<template>
  <div>
    <q-scroll-area
      ref="scrollArea"
      style="height: 74vh;">
      <infinite-loading
        class="q-pt-md"
        v-if="showInfiniteLoading && conversationId"
        spinner="waveDots"
        direction="top"
        @infinite="infiniteHandler">
        <div slot="no-more">
          {{$tr('qchat.layout.message.noMore')}}
        </div>
        <div slot="no-results">
          {{$tr('qchat.layout.message.noResults')}}
        </div>
        <div slot="error">
          {{$tr('qchat.layout.message.error')}}
        </div>
      </infinite-loading>
      <div class="q-pa-md">
        <message
          :message="message"
          v-for="(message, index) in messages"
          :key="index"/>
      </div>
    </q-scroll-area>
    <div class="col-xs-12">
      <newMessage
        @sendMessage="sendNewMessage"
        class="q-px-sm q-pb-sm"
        v-if="conversationId"/>
    </div>
  </div>
</template>

<script>
  import message from '@imagina/qchat/_components/admin/message'
  import newMessage from '@imagina/qchat/_components/admin/newMessage'
  import InfiniteLoading from 'vue-infinite-loading'
  import Pusher from 'pusher-js'

  export default {
    components:{
      message,
      newMessage,
      InfiniteLoading
    },
    props:{
      conversationId:{
        type: String,
      },
    },
    data () {
      return {
        showInfiniteLoading: false,
        messages: [],
        page: 1,
        take: 20,
        lastPage: 1,
        pusher: null,
      }
    },
    watch:{
      '$route.params.id': async function (val) {
        this.init()
      }
    },
    created(){
      this.$nextTick(() => {
        this.init()
      })
    },
    methods:{
      init(){
        this.connetPusher()
        this.messages = []
        this.page = 1
        this.showInfiniteLoading = false
        setTimeout( () => this.showInfiniteLoading = true , 500)
      },
      infiniteHandler($state){
        let params = {
          refresh: true,
          params: {
            filter: {
              conversation: this.conversationId,
              order: {
                field: 'created_at',
                way: 'desc'
              }
            },
            page: this.page,
            take: this.take,
          }
        }
        this.$crud.index('apiRoutes.qchat.messages', params).then(({ data }) => {
          if (data.length) {
            this.page += 1;
            this.messages.unshift(...data.reverse());
            $state.loaded();
          } else {
            $state.complete();
          }
        });
      },
      sendNewMessage(event){
        this.animateScroll()
        /* Add new message to array messages */
        this.messages.push(event)
        /* Get position of new message on array messages */
        let indexElement = this.messages.indexOf(event)
        let element = this.messages[indexElement]
        /* Preparing data for send message to server */
        let newMessage = {
          body: event.body,
          userId: this.$store.state.quserAuth.userId,
          conversationId: this.conversationId //this.$route.params.id
        }
        /* Send message to server */
        this.$crud.create('apiRoutes.qchat.messages', newMessage).then( response => {
          /* If server response ok the property color is update to primary */
          element.color = 'primary'
        }).catch( error => {
          /* If server response with error the property color is update to red-3 */
          element.color = 'red-3'
        })
      },
      animateScroll() {
        this.$refs.scrollArea.setScrollPosition(1000000000, 300)
      },
      async connetPusher(){
        await this.disconnectPusher()
        if ( !(this.conversationId == undefined) ) {
          /* Disconnet pusher if it has a instance */
          let key = env('PUSHER_APP_KEY')
          let config = {
            cluster:  env('PUSHER_APP_CLUSTER')
          }
          /* Init instance pusher */
          this.pusher = new Pusher(key, config)
          /* Suscribe pusher to global event */
          this.pusher.subscribe('global')
          let event = `conversation_${this.conversationId}`
          /* listen event conversation_:id */
          this.pusher.bind(event, ({data}) => {
            /* handler event when is received a new message */
            this.newMessagePusher(data)
          })
          /* Show debugging message */
          console.log(`[APP] Connecting pusher`)
        }
      },
      newMessagePusher( message ){
        if( message.userId != this.$store.state.quserAuth.userData.id ){
          /* if user that send the new message not is equal
          to user in session, the new message is concated to end the messages array */
          this.messages.push(message)
          this.animateScroll()
        }
      },
      disconnectPusher () {
        if(this.pusher !== null ){
          /* Disconnect pusher */
          this.pusher.disconnect()
          /* Show debugging message */
          console.log(`[APP] Disconnecting pusher`)
        }
      }
    }
  }
</script>
