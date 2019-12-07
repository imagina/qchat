<template>
  <div class="WAL position-relative" style="height: 85vh">
    <q-layout view="lHh Lpr lFf" class="WAL__layout shadow-3 relative-position" container>
      <q-header>
        <q-toolbar class="bg-grey-3 text-black">
          <q-btn
              round
              flat
              icon="keyboard_arrow_left"
              class="WAL__drawer-open q-mr-sm"
              @click="leftDrawerOpen = true"
          />
          <q-btn round flat v-if="Object.keys(currentUser).length>0">
            <q-avatar>
              <img :src="currentUser.mainImage">
            </q-avatar>
          </q-btn>
          <span class="q-subtitle-1 q-pl-md" v-if="Object.keys(currentUser).length>0">
            {{ currentUser.fullName }}
          </span>
          <q-space/>
          <q-input borderless v-model="filter2.search" input-class="text-right" class="q-ml-md" v-if="Object.keys(currentUser).length>0">
            <template v-slot:append>
              <q-icon v-if="filter2.search === ''" name="search" />
              <q-icon v-else name="clear" class="cursor-pointer" @click="filter2.search= ''" />
            </template>
          </q-input>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        bordered
        show-if-above
        :breakpoint="768"
        :width="calcRightHeight"
      >
        <q-toolbar class="bg-grey-3">
          <q-avatar class="cursor-pointer" v-if="userData">
            <img :src="userData.mainImage" />
            <q-tooltip transition-show="scale" transition-hide="scale" anchor="top middle">
              {{ userData.fullName }}
            </q-tooltip>
          </q-avatar>
          <q-space />
          <q-btn round flat icon="message" color="primary" @click="openNewModal = true">
            <q-tooltip transition-show="scale" transition-hide="scale" anchor="top middle">
              Nuevo Mensaje
            </q-tooltip>
          </q-btn>
          <q-btn round flat icon="more_vert" color="primary">
            <q-menu auto-close :offset="[110, 8]">
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>New group</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Archived</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Favorites</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Settings</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn
                  round
                  flat
                  icon="close"
                  class="WAL__drawer-close"
                  @click="leftDrawerOpen = false"
          />
        </q-toolbar>
        <q-toolbar class="bg-grey-2">
          <q-input rounded outlined dense class="WAL__field full-width" bg-color="white" v-model="filter.search" placeholder="Search or start a new conversation">
            <template slot="prepend">
              <q-icon name="search" />
            </template>
          </q-input>
        </q-toolbar>
        <q-scroll-area style="height: calc(100% - 100px)">
          <q-list class="conversations-container" separator>
            <q-item
                v-for="(conversation, index) in conversations"
                :key="index"
                clickable
                v-ripple
                @click="setCurrentConversation(conversation)"
            >
              <q-item-section avatar v-if="conversation.user">
                <q-avatar>
                  <img :src="conversation.user.mainImage">
                  <q-tooltip transition-show="scale" transition-hide="scale" anchor="top middle">
                    {{ conversation.user.fullName }}
                  </q-tooltip>
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1" :title="conversation.user.fullName">
                  {{ conversation.user.fullName }}
                </q-item-label>
                <q-item-label class="conversation__summary" caption v-if="conversation.messages.length">
                  <q-icon name="check" v-if="conversation.sent" />
                  <q-icon name="not_interested" v-if="conversation.deleted" />
                  {{ conversation.messages[conversation.messages.length-1].body }}
                </q-item-label>
              </q-item-section>

              <q-item-section side v-if="conversation.messages.length>0">
                <q-item-label caption>
                  {{ getFormattedChatDate(conversation.messages[conversation.messages.length-1].createdAt) }}
                </q-item-label>
                <q-icon name="done_all" v-if="conversation.messages[conversation.messages.length-1].user.id===userData.id" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container class="bg-grey-2" style="min-height: 80vh">
        <conversation v-if="currentConversationId>0" :id="currentConversationId" />
        <inner-loading :visible="loading"/>
      </q-page-container>

      <q-footer v-if="Object.keys(currentConversation).length>0">
        <q-toolbar class="bg-grey-3 text-black row">
          <picker
              native
              v-if="showEmoji"
              set="emojione"
              @select="onInput"
              class="absolute-bottom-left q-mb-xl" />
          <q-btn round flat icon="insert_emoticon" class="q-mr-sm" @click="showEmoji = !showEmoji" />
          <q-input rounded outlined dense class="WAL__field col-grow q-mr-sm" bg-color="white" v-model="form.message" placeholder="Type a message" @keypress.enter="initconversation" />
          <q-btn round flat icon="send" @click="initconversation" />
        </q-toolbar>
      </q-footer>
    </q-layout>
    <newConversation
    :open="openNewModal"
    @select="selectConversation"
    @closeModal="openNewModal = false"/>
  </div>
</template>

<script>
  import newConversation from '@imagina/qchat/_components/admin/newConversation'
  import Conversation from "@imagina/qchat/_components/admin/conversation";
  import { Picker } from 'emoji-mart-vue'
  export default {
    name: 'myConversations',
    components:{
      Conversation,
      newConversation,
      Picker,
    },
    data () {
      return {
        showEmoji: false,
        leftDrawerOpen: false,
        search: '',
        message: '',
        currentConversationId: 0,
        conversations: [],
        openNewModal: false,
        loading: false,
        filter:{
          search: '',
          order: {
            field: 'updated_at',
            way: 'desc',
          }
        },
        filter2:{
          search: '',
          order: {
            field: 'created_at',
            way: 'asc',
          }
        },
        form:{
          message: ''
        },
        currentConversation: {},
        currentUser:{},
      }
    },
    mounted(){
      this.getConversations()
    },
    methods:{
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
      getConversations(){
        this.loading = true
        let criteria = this.$store.state.quserAuth.userId
        let params = {
          refresh: true,
          params: {
            filter: this.filter,
            include: 'users,messages',
            user: criteria
          }
        }
        this.conversations = []
        this.$crud.index('apiRoutes.qchat.conversations', params).then(response => {
          response.data.forEach(item => {
            let params2 = {
              refresh: true,
              params:{
                include: 'users,messages'
              }
            }
            item.users.forEach( user =>{
              item.user = {}
              if(user.id!==this.userData.id){
                item.user = user
              }
            })
            this.conversations.push(item)
          })
          this.loading = false
        }).catch(error => {
            this.loading = false
        })
      },
      async selectConversation(user){
        this.currentUser = user
        this.createConversation()
        this.openNewModal = false
        this.getConversations()
      },
      async initconversation () {
        if (this.form.message==='null') {
          //this.$alert.error({message: this.$tr('ui.message.formInvalid'), pos: 'bottom'})
          return
        }
        let conversation = this.currentConversation

        let messageData = {
          userId: this.userData.id,
          conversationId: conversation.id,
          body: this.form.message,
        }
        await this.createMessage(messageData)

        await this.getConversations()
      },
      async createConversation(){
        let res
        let form = {
          users: [
            this.$store.state.quserAuth.userId,
            this.currentUser.id,
          ]
        }
        await this.$crud.create('apiRoutes.qchat.conversations',form)
          .then( response => {
            res = response.data
            this.currentConversation = res
          })
          .catch( error => {
            res = null
          })
        return res
      },
      async createMessage(data){
        this.$crud.create('apiRoutes.qchat.messages',data)
          .then( response => {
            this.form.message = ''
            return response.data
          })
          .catch( error => {})
      },
      setCurrentConversation(conversation){
        this.currentConversation = conversation
        this.currentUser = conversation.user
        this.currentConversationId = conversation.id
      },
      getFormattedChatDate(date){
        let td = this.$trd(date,{type: 'long'})
        return td
      }
    },
    computed: {
      userData() {
        if (this.$store.state.quserAuth){
          let user = this.$clone(this.$store.state.quserAuth.userData)
          return user
        }
        return false
      },
      calcRightHeight(){
        return this.$q.screen.gt.md?document.body.clientWidth * .25:document.body.clientWidth * .80
      }
    }
  }
</script>

<style lang="sass">
  .WAL
    width: 100%
    height: 100%
    padding: 20px
    /*&:before
      content: ''
      height: 127px
      position: fixed
      top: 0
      width: 100%
      background-color: $primary*/
    &__layout
      margin: 0 auto
      //z-index: 4000
      height: 100%
      width: 100%
      border-radius: 5px
    &__field.q-field--outlined .q-field__control:before
      border: none
    .q-drawer--standard
      .WAL__drawer-close
        display: none
    .conversations-container
      .q-item
        padding: 15px 10px
  @media (max-width: 850px)
    .WAL
      padding: 0
      &__layout
        width: 100%
        border-radius: 0
  @media (min-width: 1160px)
    .WAL
      &__drawer-open
        display: none
  .conversation__summary
    margin-top: 4px
  .conversation__more
    margin-top: 0!important
    font-size: 1.4rem
</style>
