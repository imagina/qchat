<template>
  <div class="row relative-position q-mt-lg">
    <div class="row" style="min-width: 100%">
      <div
        class="col-md-8 relative-position"
        style="border-right: #9e9e9e4d solid 1px;">
        <q-toolbar color="grey-4">
          <q-toolbar-title class="text-primary">
            <img
              :src="getUrlImg(user.smallImage || 'modules/iprofile/img/default.jpg')"
              class="avatar" style="width: 30px; height: 30px;">
            {{user.fullName}}
          </q-toolbar-title>
        </q-toolbar>
        <div class="row q-px-lg q-py-xl" style="height: 800px ">
          <div class="col-md-12">
            <messagesComponent :messages="messages.data"/>
            <div class="relative-position q-pt-lg">
              <picker
                native
                v-if="showEmoji"
                set="emojione"
                @select="onInput"
                title="Pick your emoji…"
                class="absolute-bottom-left" />
            </div>
            <q-input
              :readonly="loading"
              :before="[{icon: 'insert_emoticon',handler(){showEmoji = !showEmoji}}]"
              @keyup.enter="sendMessage()"
              placeholder="Type Message ... "
              v-model="form.message"
              :after="[{icon: 'send'}]"/>
            <inner-loading :visible="loading"></inner-loading>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <q-toolbar color="grey-7">
          <q-toolbar-title >
            Mensajes Directos
          </q-toolbar-title>
        </q-toolbar>
        <div class="row q-px-lg q-py-lg">
          <div class="col-md-12">
            <usersComponent/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import messagesComponent from '@imagina/qchat/_components/admin/thread'
  import usersComponent from '@imagina/qchat/_components/admin/users'
  import { Picker } from 'emoji-mart-vue'
  import Echo from "laravel-echo";

  export default {
    components:{
      usersComponent,
      messagesComponent,
      Picker,
    },
    data () {
      return {
        showEmoji: false,
        loading: false,
        messages: {
          data :[],
          pagination: {
            page: 1,
            rowsNumber: '',
            rowsPerPage: 9
          },
        },
        user: {},
        form:{
          message: '',
          receiverId: this.$route.params.id
        },
        echo:null,
      }
    },
    watch:{
      '$route.params.id': function (val) {
        this.getUser()
        this.form.receiverId = this.$route.params.id
        this.getThread({pagination: this.messages.pagination}, true )
        this.initPusher()
      }
    },
    created() {
      this.$nextTick(function () {
        this.getUser()
        this.getThread({pagination: this.messages.pagination}, true )
        
      })
    },
    methods : {
      getUser ( ) {
        this.loading = true
        let params = {
          refresh : true,
          params : {}
        }
        let criteria = this.$route.params.id
        this.$crud.show('apiRoutes.quser.users', criteria, params)
        .then( response => {
          this.user = response.data
          this.loading = false
        })
        .catch( error => {
          this.loading = false
        })
      },
      getThread ( {pagination}, refresh = false ) {
        let params = {
          refresh: refresh,
          params : {
            filter :{
              user: this.$route.params.id,
              type: 'thread',
              //order:{
              //  field: 'created_at',
              //  way: 'desc'
              //}
            },
            //page: pagination.page,
            //take: pagination.rowsPerPage,
          }
        }
        this.loading = true
        this.$crud.index('apiRoutes.qchat.messages', params)
        .then( response => {
          this.messages.data = response.data
          this.loading = false
        })
        .catch( error => {
          this.loading = false
        })
      },
      sendMessage () {
        if (this.form.message != ''){
          this.loading = true
          this.$crud.create('apiRoutes.qchat.messages', this.form)
          .then( response => {
            this.form.message = ''
            this.messages.data.push(response.data)
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
        if( !this.form.message ){
          this.form.message = event.native
        }else{
          this.form.message = this.form.message + event.native
        }
        this.showEmoji = false
      },
      getUrlImg(uri){
        return `${config('apiRoutes.api.base_url')}/${uri}`
      },
      initPusher(){
        this.echo = new Echo({
          broadcaster: env('BROADCAST_DRIVER', 'pusher'),
          key: env('PUSHER_APP_KEY'),
          cluster: env('PUSHER_APP_CLUSTER'),
          encrypted: env('PUSHER_APP_ENCRYPTED'),
        })
        this.echo.channel('global')
          .listen(`.notification_${this.$store.state.quserAuth.userData.id}_${this.form.receiverId}`, message => {
            this.messages.data.push(message.data)
          })
      },
      UpdateUnreadMessages(){
        //this.$crud.update('apiRoutes.qchat.messages')
      }
    }
  }
</script>

<style scoped>

</style>
