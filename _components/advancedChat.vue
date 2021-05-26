<template>
  <div id="advanceChatComponent">
    <div id="advanceChatComponentContent" class="relative-position">
      Pagination : {{ chatPagination }}
      | Messages Count {{ conversationMessages.length }}
      | Message loaded : {{ chatProps.messagesLoaded }}
      <q-separator class="q-my-md"/>
      <!--Chat component-->
      <chat-window id="vueAdvanceChat" v-bind="chatProps" @fetch-messages="getMessages" @send-message="sendMessage"
                   @add-room="showModalSearchUser = true"/>
      <!--Dialog to new room-->
      <q-dialog v-model="showModalSearchUser">
        <q-card id="showModalSearchUser" class="bg-grey-1">
          <!--Header Modal-->
          <q-toolbar class="bg-primary text-white">
            <q-toolbar-title>
              {{ this.$tr('ui.label.new') }} {{ this.$tr('ui.label.chat') }}
            </q-toolbar-title>
            <q-btn flat v-close-popup icon="fas fa-times"/>
          </q-toolbar>
          <div id="modalPostInfo" class="full-width">
            <q-card class="post-card no-shadow">
              <!--Content Dynamic-field-->
              <q-card-section class="post-card__description">
                <dynamic-field :field="fieldToNewRooms" v-model="userSelected" @input="createRoom"/>
              </q-card-section>
            </q-card>
          </div>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>
<script>
//Components
import ChatWindow from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'

export default {
  beforeDestroy() {
    this.$root.$off('page.data.refresh')
    this.$eventBus.$off('inotification.chat.message')
  },
  props: {
    roomId: {default: false},
    allowCreateChat: {default: false}
  },
  components: {ChatWindow},
  watch: {},
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      userSelected: null,
      conversations: [],
      conversationMessages: [],
      openRoomId: null,
      chatPagination: {
        page: 0,
        perPage: 50,
        lastPage: -1
      },
      loading: {
        rooms: false,
        messages: false,
      },
      search: {
        userId: null,
        userList: []
      },
      showModalSearchUser: false
    }
  },
  computed: {
    //Chat props
    chatProps() {
      return {
        currentUserId: this.$store.state.quserAuth.userId,
        rooms: this.rooms,
        loadingRooms: this.loading.rooms,
        roomsLoaded: !this.loading.rooms,
        messages: this.messages,
        loadingMessages: this.loading.messages,
        messagesLoaded: (this.chatPagination.page == this.chatPagination.lastPage) ? true : false,
        loadFirstRoom: false,
        singleRoom: this.roomId ? true : false,
        roomId: this.openRoomId,
        showAddRoom: this.allowCreateChat,
        acceptedFiles: "image/png, image/jpeg, application/pdf"
      }
    },
    //Rooms
    rooms() {
      let rooms = []//Response
      let conversations = this.$clone(this.conversations)

      //Sort conversations
      conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

      //Order room
      conversations.forEach(conversation => {
        //Defina format date to last message
        let diffDays = this.$moment().diff(this.$moment(conversation.updatedAt), 'days')
        let timestampLastMessage = (diffDays <= 0) ? this.$trd(conversation.updatedAt, {type: 'time'}) :
            (diffDays <= 7 ? this.$trd(conversation.updatedAt, {type: 'day'}) : this.$moment(conversation.updatedAt).format('MM/DD/YYYY'))

        //Instance roorm
        let room = {
          roomId: conversation.id,
          roomName: conversation.userConversation.fullName,
          avatar: conversation.userConversation.mainImage,
          unreadCount: conversation.unreadMessagesCount || false,
          lastMessage: !conversation.lastMessage ? false : {
            content: conversation.lastMessage.body,
            senderId: conversation.lastMessage.userId,
            timestamp: timestampLastMessage
          },
          users: [
            {
              _id: conversation.users[0].id,
              username: conversation.users[0].fullName,
              avatar: conversation.users[0].mainImage,
            },
            {
              _id: conversation.users[1].id,
              username: conversation.users[1].fullName,
              avatar: conversation.users[1].mainImage,
            },
          ]
        }
        //Push room
        rooms.push(room)
      })

      //Response
      return this.$clone(rooms)
    },
    //Messages
    messages() {
      let messages = []//Response
      let conversationMessages = this.$clone(this.conversationMessages).reverse()

      //Order room
      conversationMessages.forEach(messageData => {
        if (!messages.find(message => message._id == messageData.id)) {
          //Instance message
          let message = {
            _id: messageData.id,
            content: messageData.body,
            senderId: messageData.user.id,
            username: messageData.user.fullName,
            avatar: messageData.user.mainImage,
            date: this.$trd(messageData.createdAt),
            timestamp: this.$trd(messageData.createdAt, {type: 'time'}),
            seen: true
          }
          //Push room
          messages.push(message)
        }
      })
      //Response
      return this.$clone(messages)
    },
    //Field to dynamic field, new rooms
    fieldToNewRooms() {
      return {
        value: null,
        type: 'select',
        props: {
          label: 'Search...',
          clearable: true
        },
        loadOptions: {
          apiRoute: 'apiRoutes.quser.users',
          select: {label: 'fullName', id: 'id'},
          filterByQuery: true
        }
      }
    },
  },
  methods: {
    init() {
      //Listen events
      this.listenEvents()
      //Load rooms
      this.getRooms()
    },
    //Listen pusher message
    listenEvents() {
      //Refresh page
      this.$root.$on('page.data.refresh', () => {
        this.getRooms(true)
      })
      //New message from pusher
      this.$eventBus.$on('inotification.chat.message', (response) => {
        if (response.data) this.pushMessage(response.data)
      })
    },
    //Get auth user rooms
    getRooms(refresh = false) {
      return new Promise((resolve, reject) => {
        this.loading.rooms = true
        this.openRoomId = null//Reset room selected
        this.conversations = []//Reset conversation
        this.conversationMessages = []//Reset conversation messages

        //Request Params
        let requestParams = {
          refresh: true,
          params: {include: 'users,lastMessage,conversationUsers'}
        }

        //Request
        if (this.roomId) {//Get only one room
          this.$crud.show('apiRoutes.qchat.conversations', this.roomId, requestParams).then(response => {
            this.orderConversationData([response.data])
            this.openRoomId = this.conversations[0].id
            this.loading.rooms = false // stop load Rooms
            resolve(response.data)
          }).catch(error => {
            this.loading.rooms = false
            resolve(error)
          })
        } else {//Get user auth rooms
          this.$crud.index('apiRoutes.qchat.conversations', requestParams).then(response => {
            this.orderConversationData(response.data)
            this.loading.rooms = false
            resolve(response.data)
          }).catch(error => {
            this.loading.rooms = false
            resolve(error)
          })
        }
      })
    },
    //Order conversation Data (Transform)
    orderConversationData(conversations) {
      //Transform data
      conversations.forEach(conversation => {
        //Set to first level conversation user
        conversation.userConversation = {
          ...conversation.conversationUsers.find(user => user.userId != this.$store.state.quserAuth.userId),
          ...conversation.users.find(user => user.id != this.$store.state.quserAuth.userId)
        }
        //Set to first level conversation auth user
        conversation.authUserConversation = {
          ...conversation.conversationUsers.find(user => user.userId == this.$store.state.quserAuth.userId),
          ...conversation.users.find(user => user.id == this.$store.state.quserAuth.userId)
        }
        //Set to first level unread messages count
        conversation.unreadMessagesCount = parseInt(conversation.authUserConversation.unreadMessagesCount)
      })

      //Assign conversation data
      this.conversations = this.$clone(conversations)
    },
    //Get messages
    getMessages({room, options}) {
      return new Promise((resolve, reject) => {
        this.loading.messages = true
        //Reset room data
        if (options && options.reset) {
          this.conversationMessages = []//Reset chat messages
          this.chatPagination.page = 0//Reset chat page
          this.chatPagination.lastPage = -1//Reset chat plast page
        }
        //Order room data after open
        this.openRoomId = room.roomId//Set open room id
        //Reset unread message to conversation
        let conversationIndex = this.conversations.findIndex(item => item.id == room.roomId)
        this.conversations[conversationIndex].unreadMessagesCount = false
        //Request params
        let requestParams = {
          refresh: true,
          params: {
            page: (this.chatPagination.page + 1),
            take: this.chatPagination.perPage,
            filter: {conversationId: room.roomId},
            include: 'user'
          }
        }

        //Request
        this.$crud.index('apiRoutes.qchat.messages', requestParams).then(response => {
          //reset conversation messages
          if (options && options.reset) this.conversationMessages = []
          //Set messages
          this.conversationMessages = this.$clone([...this.conversationMessages, ...response.data])
          //Set chat pagination
          this.chatPagination.lastPage = response.meta.page.lastPage
          this.chatPagination.page = response.meta.page.currentPage
          //Hide loading
          this.loading.messages = false
          resolve(response.data)
        }).catch(error => {
          this.loading.messages = false
          resolve(error)
        })
      })
    },
    //Send message
    sendMessage({content, roomId, file, replyMessage}) {
      return new Promise((resolve, reject) => {
        if (content.length) {
          //Request data
          let requestData = {
            conversationId: roomId,
            body: content,
            userId: this.$store.state.quserAuth.userId
          }
          //Request
          this.$crud.create('apiRoutes.qchat.messages', requestData)
          //push Message
          this.pushMessage({body: content})
        }
        if (file) {
          let requestData = {
            conversationId: roomId,
            body: file,
            userId: this.$store.state.quserAuth.userId
          }
          //Request
          this.$crud.create('apiRoutes.qchat.messages', requestData)
          //push Message
          this.pushMessage({body: file})
        }

      })
    },
    //Push new message
    pushMessage(message) {
      //Get current conversation ID
      let conversationId = message.conversation ? message.conversation.id : this.openRoomId
      //Get current conversation Index
      let conversationIndex = conversationId ? this.conversations.findIndex(item => item.id == conversationId) : false
      //Get current conversation
      let conversation = (conversationIndex >= 0) ? this.conversations[conversationIndex] : false

      //Message object data
      let messageData = {
        id: this.$uid(),
        user: (message.userId && conversation) ?
            conversation.users.find(user => user.id == message.userId) : this.$store.state.quserAuth.userData,
        createdAt: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        ...message
      }

      //Add conversation if not exist
      if (!conversation && message.conversation) {
        this.orderConversationData([...this.conversations, {
          ...message.conversation,
          lastMessage: messageData
        }])
      }

      //Update conversation data
      if (conversation) {
        //Update last update date
        this.conversations[conversationIndex].updatedAt = this.$moment().format('YYYY-MM-DD HH:mm:ss')
        //Update last message
        this.conversations[conversationIndex].lastMessage = messageData
        //Add unread message counter
        if (message.conversation && (message.conversation.id != this.openRoomId)) {
          this.conversations[conversationIndex].unreadMessagesCount += 1
        }
      }

      //Set local message
      if (!message.conversation || (message.conversation.id == this.openRoomId)) {
        this.conversationMessages.unshift(messageData)
      }
    },
    //Create conversation
    createRoom(userId) {
      return new Promise((resolve, reject) => {
        this.userSelected = null//clear, search crate room
        this.showModalSearchUser = false//close modal Create room

        //validate user selected is not same to auth user
        if (userId == this.chatProps.currentUserId) {
          this.showModalSearchUser = false//close modal Create room
          this.$alert.error(this.$tr('ui.message.errorRequest'))
          return reject(false)
        }

        //Validate if conversation already exist
        let existConversation = this.conversations.find(conversation => {
          return conversation.users.find(user => user.id == userId) ? conversation : false
        })

        //Open conversation
        if (existConversation) {
          this.openRoomId = existConversation.id
          return resolve(existConversation)
        }

        //Request Params
        let requestParams = {users: [userId, this.chatProps.currentUserId]}
        this.loading.rooms = true
        //Request to Create conversation
        this.$crud.create('apiRoutes.qchat.conversations', requestParams).then(async response => {
          await this.getRooms(true)
          this.openRoomId = response.data.id
          resolve(response.data)
        }).catch(error => {
          this.loading.rooms = false
          reject(error)
        })

      })
    },
  }
}
</script>
<style lang="stylus">
#advanceChatComponentContent
  #vueAdvanceChat
    .vac-room-list
      .vac-room-item
        min-height auto
        padding 8px 10px 8px 8px

        .vac-avatar
          margin-right 8px

        .vac-badge-counter
          height 17px
          width 17px
          font-size 10px
          background-color $blue

#showModalSearchUser
  min-width 300px !important
  max-width 300px !important
</style>
