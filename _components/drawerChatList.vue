<template>
  <div id="drawerChatComponent" class="q-pa-md" v-if="$hasAccess('ichat.conversations.index')">
    <!-- ===== Header ===== -->
    <div class="row justify-between items-center">
      <div class="text-subtitle1 row items-center">
        <q-icon name="fa-light fa-message" color="primary" size="20px" class="q-mr-sm"/>
        <label>{{ $tr('isite.cms.label.chat', {capitalize: true}) }}</label>
      </div>
      <!-- Close icon -->
      <q-icon name="fas fa-times" color="blue-grey" size="20px" class="cursor-pointer"
              @click="eventBus.emit('toggleMasterDrawer', 'chat')"/>
    </div>

    <!--Separator-->
    <q-separator class="q-my-md"/>

    <!--Content-->
    <div class="relative-position">
      <!--Search-->
      <q-select outlined dense v-model="search.userId" use-input hide-selected emit-value map-options
                input-debounce="800" :options="search.userList" @filter="searchUsers"
                :placeholder="`${$tr('isite.cms.label.find')} ${$tr('isite.cms.label.user')}...`"
                @update:modelValue="createConversation" style="width: 100%" class="q-mb-sm">
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              {{ $tr('isite.cms.message.searchNotFound') }}
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!--Conversations-->
      <div id="userListcontent" class="relative-position">
        <!--Loading-->
        <inner-loading :visible="conversations.loading"/>
        <!--Empty results-->
        <not-result v-if="!conversations.loading && !conversations.list.length" class="q-my-lg"/>
        <!--Conversations list-->
        <q-list v-if="!conversations.loading && conversations.list.length">
          <template
            v-for="(conversation, key) in conversationsList"
            :key="key"
          >
            <q-item
              clickable
              class="q-px-xs"
              @click.native="openChat(conversation)"
              v-if="conversation.userData"
            >
              <!--User picture-->
              <q-item-section avatar>
                <q-avatar v-if="conversation.userData && conversation.userData?.mainImage ? true : false">
                  <img :src="conversation.userData?.mainImage">
                </q-avatar>
              </q-item-section>
              <!--User Fullname-->
              <q-item-section class="ellipsis text-capitalize">
                {{ conversation.userData.fullName.toLowerCase() }}
              </q-item-section>
              <!--Unread badge-->
              <q-item-section v-if="conversation.unReadMessages" side>
                <q-icon name="fas fa-circle" color="teal" size="14px"/>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>
    </div>

    <!--Personal chat-->
    <q-dialog id="personalChatContent" v-model="chat.open" seamless position="bottom">
      <q-card style="width: 350px" v-if="chat.conversation">
        <!--Toolbar-->
        <q-toolbar>
          <!--User Image-->
          <q-avatar><img :src="chat?.conversation?.userData?.mainImage"></q-avatar>
          <!--User FullName-->
          <q-toolbar-title> {{ chat.conversation.userData.fullName }}</q-toolbar-title>
          <!--Close bottom-->
          <q-btn flat round dense icon="fa fa-close" v-close-popup/>
        </q-toolbar>

        <!--Separator-->
        <q-separator/>

        <!--Chat content-->
        <div id="chatBodyContent" ref="chatBodyContent">
          <q-infinite-scroll ref="chatInfiniteSroll" @load="getMessages" reverse scroll-target="#chatBodyContent"
                             :offset="100" v-if="chat.open">
            <!--Loading-->
            <div class="text-center q-py-xs" v-if="chat.loading">
              <q-spinner-dots color="primary" size="2em"/>
            </div>
            <!--Messages-->
            <div style="width: 100%" class="q-py-sm q-px-md">
              <!--Empty chat-->
              <div v-if="!chat.loading && !messageList.length" class="text-center text-grey-7 q-mt-md">
                {{ $tr('ichat.cms.message.noMessages') }}
              </div>
              <!--Messages-->
              <q-chat-message v-for="(message, key) in messageList" :key="key" :sent="message.sent ? true : false"
                              :text="[message.text]" :stamp="message.stamp" :bg-color="message.color"/>
            </div>
          </q-infinite-scroll>
        </div>

        <!--Chat input-->
        <div id="inputChatContent" class="q-pa-sm">
          <q-input dense outlined v-model="chat.textMessage" ref="inputChat" :placeholder="$tr('ichat.cms.label.sendMessage')"
                   color="grey-8" @keyup.enter="sendMessage">
            <!--Send button-->
            <template v-slot:append>
              <q-btn unelevated icon="fas fa-paper-plane" @click="sendMessage" padding="sm"/>
            </template>
          </q-input>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { eventBus } from 'src/plugins/utils'
export default {
  beforeUnmount() {
    eventBus.off('inotification.chat.message')
  },
  props: {},
  components: {},
  mounted() {
    this.$nextTick(async function () {
      this.init()
    })
  },
  data() {
    return {
      search: {
        userId: null,
        userList: []
      },
      conversations: {
        loading: false,
        list: []
      },
      chat: {
        loading: false,
        open: false,
        conversation: false,
        pagination: {
          perPage: 20,
          page: 0,
          lastPage: 5
        },
        messages: [],
        scrollInfo: false,
        textMessage: '',
      },
      eventBus
    }
  },
  computed: {
    //Conversation list
    conversationsList() {
      let showBadge = false//Default option to badge
      let conversations = this.$clone(this.conversations.list)
      //Transform conversations
      conversations.forEach(item => {
        //Get data of other user conversation
        let userConversation = item.users.find(item => item.id != this.$store.state.quserAuth.userId)
        if (userConversation)
          item.userData = {
            id: userConversation.id,
            mainImage: userConversation?.mainImage,
            fullName: userConversation.fullName
          }
        //Show badge in header
        if (item.unReadMessages) showBadge = true
      })
      //Emit badge to new message
      eventBus.emit('header.badge.manage', {chat: showBadge})
      //Response
      return conversations
    },
    //Chat ocntent style
    chatContentStyle() {
      return {
        thumbStyle: {
          right: '4px',
          borderRadius: '5px',
          backgroundColor: '#aaadba',
          width: '5px',
          opacity: 0.75
        },
        barStyle: {
          right: '2px',
          borderRadius: '9px',
          backgroundColor: '#c2c5c6',
          width: '9px',
          opacity: 0.2
        }
      }
    },
    //Messages List
    messageList() {
      let messages = this.$clone(this.chat.messages).reverse()
      //Transform data
      messages.forEach(item => {
        item.text = item.body
        item.sent = item.userId == this.$store.state.quserAuth.userId ? true : false
        item.stamp = this.$trd(item.createdAt, {type: 'time'})
        item.color = item.sent ? 'grey-4' : 'indigo-2'
      })
      //Response
      return messages
    }
  },
  methods: {
    init() {
      //Get conversations
      this.getConversations(true)
      //Listen event to push new messages
      this.listenPusher()
    },
    //Listen pusher message
    listenPusher() {
      eventBus.on('inotification.chat.message', (response) => {
        if (response.data) {
          let message = response.data//Get message
          //Push message
          if (this.chat.open && (this.chat.conversation.id == message.conversationId)) {
            this.pushMessage(message)
          } else {//Set unread message
            let cIndex = this.conversations.list.findIndex(item => item.id == message.conversationId)
            if (cIndex != -1) this.conversations.list[cIndex].unReadMessages = true
            else this.getConversations(true)
          }
        }
      })
    },
    //Search users
    searchUsers(val, update, abort) {
      //Validate length of val
      if (val.length < 2) return abort()
      let params = {params: {take: 20, filter: {search: val}}}
      //Request
      this.$crud.index('apiRoutes.quser.users', params).then(response => {
        update(() => {
          let userId = this.$store.state.quserAuth.userId
          let options = []
          response.data.forEach(item => {
            if (item.id != userId) options.push({label: item.fullName, value: item.id})
          })
          this.search.userList = this.$clone(options)
        })
      }).catch(error => {
        this.$apiResponse.handleError(error, () => {
          update(() => {
            this.search.userList = []
          })
        })
      })
    },
    //Get conversations
    getConversations(refresh = false) {
      return new Promise((resolve, reject) => {
        this.conversations.loading = true
        //Request Params
        let requestParams = {
          refresh: refresh,
          params: {include: 'users,lastMessage'}
        }

        //Reques
        this.$crud.index('apiRoutes.qchat.conversations', requestParams).then(response => {
          this.conversations.list = response.data
          this.conversations.loading = false
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
            this.conversations.loading = false
          })
        })
      })
    },
    //Create conversation
    createConversation(userId) {
      return new Promise(resolve => {
        let existConversation = false//To know if conversation already exist
        let usersIds = [userId, this.$store.state.quserAuth.userId]//Users to conversation
        this.search.userId = null //Reset search selection

        //Validate if conversation already exist
        this.conversationsList.forEach(conversation => {
          let cUsersId = conversation.users.map(user => user.id)
          if ((cUsersId.indexOf(usersIds[0]) != -1) && (cUsersId.indexOf(usersIds[1]) != -1))
            existConversation = conversation
        })

        //Open conversation
        if (existConversation) {
          this.openChat(existConversation)
        } else {//Create conversation
          this.conversations.loading = true
          //Request
          this.$crud.create('apiRoutes.qchat.conversations', {users: usersIds}).then(async response => {
            this.conversations.list.push(response.data)//Set conversation to list
            this.openChat(this.conversationsList.find(item => item.id == response.data.id))//Open conversation
            this.conversations.loading = false
          }).catch(error => {
            this.conversations.loading = false
          })
        }
      })
    },
    //Open chat
    openChat(conversation) {
      //Function to open chat
      const doAction = () => {
        setTimeout(() => {
          this.$refs.chatInfiniteSroll.reset()//Reset infinite scroll
          this.$refs.chatInfiniteSroll.updateScrollTarget()//Reset infinite scroll
          this.$refs.chatInfiniteSroll.poll()//Poll infinite scroll
          this.$refs.inputChat.focus()//Focus input
        }, 100)
        this.chat.conversation = conversation//Set user
        this.chat.open = true//Open modal
        this.chat.messages = []//Reset messages
        this.chat.pagination.page = 0//Reset page
        //Remove unread message
        let cIndex = this.conversations.list.findIndex(item => item.id == conversation.id)
        this.conversations.list[cIndex].unReadMessages = false
      }

      //Open modal
      if (!this.chat.open || (this.chat.conversation.id != conversation.id)) {
        //Set chat
        if (this.chat.open) {
          this.chat.open = false//Close modal
          setTimeout(() => doAction(), 300)
        } else doAction()
      }
      //Toogle drawer chat
      eventBus.emit('toggleMasterDrawer', 'chat')
    },
    //Get chatData
    getMessages(index, done) {
      return new Promise((resolve, reject) => {
        this.chat.pagination.page += 1 //up page
        if (this.chat.pagination.page <= this.chat.pagination.lastPage) {
          if (this.chat.pagination.page == 1) this.chat.messages = []
          this.chat.loading = true
          //Request params
          let requestParams = {
            refresh: true,
            params: {
              page: this.chat.pagination.page,
              take: this.chat.pagination.perPage,
              filter: {conversationId: this.chat.conversation.id}
            }
          }
          //Request
          this.$crud.index('apiRoutes.qchat.messages', requestParams).then(response => {
            this.chat.messages = this.chat.messages.concat(response.data)
            this.chat.pagination.lastPage = response.meta.page.lastPage
            this.chat.loading = false
            done()
          }).catch(error => {
            this.$apiResponse.handleError(error, () => {
              this.chat.loading = false
            })
          })
        } else {
          this.$refs.chatInfiniteSroll.stop()//Stop infinite scroll
          if (done) done()
        }
      })
    },
    //Set emoji
    setEmoji(event) {
      //Get current text
      let inputText = this.$clone(this.chat.textMessage)
      //Get cursor position form input
      let input = this.$refs.inputChat.$refs.input
      let currentPosition = input.selectionStart
      //Split current text to set emoji
      let partA = inputText.substring(0, currentPosition)
      let partB = inputText.substring(currentPosition, inputText.length)
      //Set emoji
      this.chat.textMessage = partA + event + partB
    },
    //Send message
    sendMessage() {
      return new Promise((resolve, reject) => {
        if (this.chat.textMessage.length) {
          //Request data
          let requestData = {
            conversationId: this.chat.conversation.id,
            body: this.chat.textMessage,
            userId: this.$store.state.quserAuth.userId
          }
          //Request
          this.$crud.create('apiRoutes.qchat.messages', requestData)
          //Push message
          this.pushMessage(requestData)
        }
      })
    },
    //Push new message
    pushMessage(message) {
      //Set local message
      this.chat.messages.unshift({createdAt: this.$moment().format(), ...message})
      this.chat.textMessage = ''
      //Set end scroll to chat content
      setTimeout(() => {
        this.$refs.chatBodyContent.scrollTo(0, this.$refs.chatBodyContent.scrollHeight)
      }, 100)
    }
  }
}
</script>
<style lang="scss">
#drawerChatComponent {
  #userListcontent {
    min-height: 150px;
  }
}

#personalChatContent {
  .q-dialog__inner {
    justify-content: flex-end;
  }

  .q-card {
    overflow-y: hidden !important;
    border-radius: 10px 10px 0 0;
    box-shadow: $shadow-9;

    .q-toolbar {
      .q-toolbar__title {
        font-size: 14px;
      }
    }

    #chatBodyContent {
      height: 360px;
      max-height: 360px;
      overflow: auto;

      .q-infinite-scroll {
        min-height: 360px;
      }

      .q-message {
        .q-message-stamp {
          font-size: 10px;
        }

        &.q-message-sent {
          .q-message-stamp {
            text-align: right;
          }
        }
      }
    }

    #inputChatContent {
      max-height: 56px;

      .q-field__control {
        padding-left: 0;
        padding-right: 0;
      }

      #popper-button {
        height: 40px;
        width: 40px;
        outline: none;

        #btn-emoji-default {
          margin: 0;
          height: 40px;
          width: 40px;
          padding: 0;
          outline: none;

          .fade-in {
            height: 40px;
            width: 40px;

            img {
              margin-top: 7px;
              width: 25px;
              height: 25px;
            }
          }
        }
      }
    }
  }
}
</style>
