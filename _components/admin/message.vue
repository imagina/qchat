<template>
  <q-chat-message
    class="relative-position"
    :bg-color="message.color || 'primary'"
    text-color="white"
    :name="isSendMessage(message) ? 'me' : message.user.fullName"
    :avatar="message.user.mainImage"
    :stamp="message.createdAt | moment('h:mm a')"
    :sent="isSendMessage(message)">
    <div class="q-mr-lg">
      {{message.body}}
    </div>
    <div v-if="isSendMessage(message)">
      <q-icon
        v-if="message.color && message.color != 'primary'"
        name="fas fa-check"
        size="10px"
        class="absolute-top-right q-mt-xs q-mr-xs"/>
      <q-icon
        v-else
        name="fas fa-check-double"
        size="10px"
        class="absolute-top-right q-mt-xs q-mr-xs"/>
    </div>
  </q-chat-message>
</template>

<script>
  export default {
    props:{
      message:{
        type: Object,
        default: () => {
          return {
            createdAt: '',
            body: '',
            user: {
              mainImage: ''
            }
          }
        }
      }
    },
    methods:{
      isSendMessage(message) {
        if ( message.userId == this.$store.state.quserAuth.userId) {
          return true
        }
        return false
      },
    }
  }
</script>

<style>

</style>
