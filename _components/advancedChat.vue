<template>
  <div id="chatPage">
    <div class="relative-position">
      <q-dialog v-model="showModalSearchUser">
        <q-card id="showModalSearchUser" class="bg-grey-1">
          <!--Header Modal-->
          <q-toolbar class="bg-primary text-white">
            <q-toolbar-title>
              {{ this.$tr('ui.label.create') }} {{ this.$tr('ui.label.room') }}
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

      <chat-window v-bind="chatProps" :single-room="singleRoom" @fetch-messages="getMessages"
                   @send-message="sendMessage" @add-room="showModalSearchUser = true" :room-id="openRoomId"
                   :show-add-room="$auth.hasAccess('ichat.conversations.create') ? true :  false"
                   accepted-files="image/png, image/jpeg, application/pdf">
      </chat-window>
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
    roomsId: {default: false}
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
      openRoomId: null,
      singleRoom: false,
      conversationMessages: [],
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
        messagesLoaded: !this.loading.messages,
        loadFirstRoom: false,
      }
    },
    //Rooms
    rooms() {
      let rooms = []//Response
      let conversations = this.$clone(this.conversations)
      //Order room
      conversations.forEach(conversation => {
        //get user conversation
        let userConversation = conversation.users.find(user => user.id != this.$store.state.quserAuth.userId)
        //Instance roorm
        let room = {
          roomId: conversation.id,
          roomName: userConversation.fullName,
          avatar: userConversation.mainImage,
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

        //Instance roorm
        let message = {
          _id: messageData.id,
          content: messageData.body,
          senderId: messageData.user.id,
          username: messageData.user.fullName,
          avatar: messageData.user.mainImage,
          date: this.$trd(messageData.createdAt),
          timestamp: this.$trd(messageData.createdAt, {type: 'time'}),
          system: false,
          saved: true,
          seen: true,
        }
        //Push room
        messages.push(message)
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
      this.listenEvents()
      this.loadRooms()
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

    //load Rooms
    loadRooms() {
      if (this.roomsId != false) {
        //Single room
        this.singleRoom = true
        this.getRoom()

      } else { // Serval Room
        this.getRooms()
      }
    },

    //Get room
    getRoom(refresh = false) {
      return new Promise((resolve, reject) => {
        this.loading.rooms = true //Loading rooms
        this.conversations = []//Reset conversation
        this.conversationMessages = []//Reset conversation messages
        //Request Params
        let requestParams = {refresh: true}
        //Reques
        this.$crud.show('apiRoutes.qchat.conversations', this.roomsId, requestParams).then(response => {
          this.conversations = [response.data]
          this.openRoomId = this.conversations[0].id
          this.loading.rooms = false // stop load Rooms
          this.chatProps.singleRoom = true
          resolve(response.data)
        }).catch(error => {
          this.loading.rooms = false
          resolve(error)
        })
      })
    },
    //Get rooms
    getRooms(refresh = false) {
      return new Promise((resolve, reject) => {
        this.loading.rooms = true
        this.conversations = []//Reset conversation
        this.conversationMessages = []//Reset conversation messages

        //Request Params
        let requestParams = {refresh: true}

        //Reques
        this.$crud.index('apiRoutes.qchat.conversations', requestParams).then(response => {
          this.conversations = response.data
          this.openRoomId = this.conversations.find(conversation => {
            return conversation.users.find(user => user.id == userId) ? conversation : false
          }),
            this.loading.rooms = false
          resolve(response.data)
        }).catch(error => {
          this.loading.rooms = false
          resolve(error)
        })
      })
    },
    //Get messages
    getMessages({room, options}) {
      return new Promise((resolve, reject) => {
        this.conversationMessages = []//Reset conversation messages
        this.loading.messages = true
        //Request params
        let requestParams = {
          refresh: true,
          params: {
            page: 1,
            take: 10,
            filter: {conversationId: room.roomId}
          }
        }
        //Request
        this.$crud.index('apiRoutes.qchat.messages', requestParams).then(response => {
          this.conversationMessages = response.data
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
      //Set local message
      this.conversationMessages.unshift({
        id: this.$uid(),
        user: this.$store.state.quserAuth.userData,
        createdAt: this.$moment().format(),
        ...message
      })
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
        this.$crud.create('apiRoutes.qchat.conversations', requestParams).then(response => {

          this.conversations = [...this.conversations, response.data]//Set conversation to list
          this.openRoomId = response.data.id
          this.loading.rooms = false
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
#showModalSearchUser
  min-width 300px !important
  max-width 300px !important
</style>
