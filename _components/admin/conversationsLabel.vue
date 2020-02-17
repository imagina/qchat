<template>
  <div>
    <q-item
      :class="`bordered-b ${this.$route.params.id == conversation.id ? 'bg-grey-2': ''}`"
      v-if="conversation"
      clickable
      @click="redirectToConversation(conversation)">
      <q-item-section avatar>
        <q-avatar class="q-ma-sm">
          <img :src="conversation.user.smallImage">
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{conversation.user.fullName}}
        </q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-icon
          :color="`${conversation.lastMessageReaded ? 'primary' : 'grey-5'}`"
          name="fas fa-comment-dots">
          <q-badge
            color="green"
            floating
            style="width: 1px; height: 12px; border-radius: 50%"
            v-if="conversation.lastMessageReaded"/>
        </q-icon>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
  export default {
    props: {
      conversation:{
        type: Object,
        required: true,
        default: () => {}
      },
    },
    computed:{
 
    },
    methods:{
      redirectToConversation(conversation){
        this.$router.push({
          name: 'qchat.admin.conversation.show',
          params:{
            id: this.conversation.id
          }
        })
      }
    }
  }
</script>
