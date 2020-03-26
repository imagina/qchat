<template>
  <div>
    <q-input
      rounded
      dense
      @keyup.enter="handlerClick()"
      outlined
      v-model="message"
      :placeholder="`Enviar mensage a @${user.firstName}`">
      <template v-slot:append>
        <q-spinner-comment
          v-if="loading"
          color="primary"
          size="sm" />
        <q-btn
          v-else
          flat
          @click="handlerClick"
          size="sm"
          round >
          <q-icon name="far fa-paper-plane" />
        </q-btn>
      </template>
    </q-input>
  </div>
</template>

<script>
  export default {
    props:{
      user:{
        type: Object,
        default: () => {},
        required: true
      }
    },
    data(){
      return {
        loading: false,
        message: '',
        conversation: {},
      }
    },
    methods:{
      async handlerClick(){
        if(this.message){
          this.loading = true
          let conversation = {}
          conversation = await this.getConversation()
          if (conversation == undefined){
            conversation = await this.createConversation()
          }
          this.conversation = conversation
          await this.sendMessage(conversation)
          this.loading = false
        }
      },
      async getConversation(){
        let conversation = {}
        let params = {
          refresh: true,
          params: {
            filter: {
              between: [
                this.user.id,
                this.$store.state.quserAuth.userId
              ]
            },
          }
        }
        await this.$crud.index('apiRoutes.qchat.conversations', params).then( ({data}) => {
          conversation = data[0]
        }).catch( error => {
          this.$alert.error({
            message: this.$tr('ui.message.errorRequest'),
            pos: 'bottom'
          })
        })
        return conversation
      },
      async createConversation() {
        let form = {
          private: false,
          users: [
            this.user.id,
            this.$store.state.quserAuth.userId
          ]
        }
        let conversation = {}
        await this.$crud.create('apiRoutes.qchat.conversations', form).then( ({data}) => {
          conversation = data
        }).catch( error => {
          this.$alert.error({
            message: this.$tr('ui.message.errorRequest'),
            pos: 'bottom'
          })
        })
        return conversation
      },
      async sendMessage(conversation){
        let form = {
          body: this.message,
          userId: this.$store.state.quserAuth.userId,
          conversationId: conversation.id
        }
        await this.$crud.create('apiRoutes.qchat.messages', form).then( ({data}) => {
          this.message = ''
          this.$root.$emit('newNewConversationMessage', this.conversation)
          this.$router.push({
            name: 'qchat.admin.conversation.show',
            params:{
              id: conversation.id
            }
          })
        }).catch( error => {
          this.$alert.error({
            message: this.$tr('ui.message.errorRequest'),
            pos: 'bottom'
          })
        })
      }
    }
  }
</script>