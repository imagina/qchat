<template>
  <div>
    <q-input
      rounded
      dense
      @keyup.enter="handlerClick()"
      outlined
      v-model="message"
      :placeholder="`Enviar mensage a ${user.firstName}`">
      <template v-slot:append>
        <q-btn
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
        message: '',
      }
    },
    methods:{
      async handlerClick(){
        if(this.message){
          let conversation = []
           conversation = await this.getConversation()
          console.warn(conversation)
          return
          //  ----------
          if (conversation.length == 0){
            conversation = await this.createConversation()
          }
          await this.sendMessage(conversation)
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
          conversation = data
        }).catch( error => {
          this.$alert.error({
            message: this.$tr('ui.message.errorRequest'),
            pos: 'bottom'
          })
        })
        return conversation
      },
      async createConversation() {
        let form = {}
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
        let form = {}
        await this.$crud.create('apiRoutes.qchat.conversations', form).then( ({data}) => {
          this.message = ''
          // redirect to conversation
          // hide users panel
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