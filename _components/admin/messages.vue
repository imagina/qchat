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
      }
    },
    watch:{
      '$route.params.id': function (val) {
        this.messages = []
        this.page = 1
        this.showInfiniteLoading = false
        setTimeout( () => {
          this.showInfiniteLoading = true
        }, 500)
      }
    },
    mounted(){
      this.$nextTick(() => {
        this.showInfiniteLoading = false
        this.messages = []
        this.page = 1
        setTimeout( () => {
          this.showInfiniteLoading = true
        }, 5000)
      })
    },
    methods:{
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
          conversationId: this.$route.params.id
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
      }
      
    }
  }
</script>

<style scoped>

</style>
