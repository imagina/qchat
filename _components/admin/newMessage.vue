<template>
<div>
  <q-input
    ref="inputval"
    rounded
    outlined
    @keyup.enter="sendMessage()"
    v-model="message"
    :placeholder="$tr('qchat.layout.form.typeAMessageHere')">
    <template v-slot:prepend >
      <twemoji-picker
        @emojiUnicodeAdded="onEnterKey"
        :emojiData="emojiDataAll"
        :emojiGroups="emojiGroups"
        :recentEmojisFeat="true"
        :skinsSelection="true"/>
    </template>
    <template v-slot:append>
      <q-btn
        @click="sendMessage"
        flat
        round>
        <q-icon name="far fa-paper-plane" />
      </q-btn>
    </template>
  </q-input>
</div>
</template>

<script>

  import { TwemojiPicker } from '@kevinfaguiar/vue-twemoji-picker';
  import EmojiAllData from '@kevinfaguiar/vue-twemoji-picker/emoji-data/es/emoji-all-groups.json';
  import EmojiDataAnimalsNature from '@kevinfaguiar/vue-twemoji-picker/emoji-data/es/emoji-group-animals-nature.json';
  import EmojiDataFoodDrink from '@kevinfaguiar/vue-twemoji-picker/emoji-data/es/emoji-group-food-drink.json';
  import EmojiGroups from '@kevinfaguiar/vue-twemoji-picker/emoji-data/emoji-groups.json';

  export default {
    components: {
      'twemoji-picker': TwemojiPicker
    },
    data () {
      return {
        message: ''
      }
    },
    computed: {
      emojiDataAll() {
        return EmojiAllData;
      },
      emojiGroups() {
        return EmojiGroups;
      }
    },
    methods:{
      onEnterKey(event) {
        /* Get cursor position in input */
        let input = this.$refs.inputval.$refs.input
        let currentPosition  = input.selectionStart
        /* Split string in two parts */
        let partA = this.message.substring(0, currentPosition)
        let partB = this.message.substring(currentPosition, this.message.length)
        /* Join partA, event (emoji) and partB */
        this.message = partA + event + partB
      },
      sendMessage(){
        if (this.message != ''){
          let data = {
            color: 'grey-5',
            userId: this.$store.state.quserAuth.userId,
            createdAt: '2019-12-12 15:14:08',
            body: this.message,
            user: {
              mainImage: this.$store.state.quserAuth.userData.mainImage
            }
          }
          this.$emit('sendMessage', data)
          this.message = ''
        }
      }
    }
  }
</script>

<style>
  .emoji-popover-inner::-webkit-scrollbar-track, .scroll-min::-webkit-scrollbar-track
  {
    background-color: #fff;
  }

  .emoji-popover-inner::-webkit-scrollbar
  {
    width: 8px;
    background-color: #F5F5F5;
  }

  .scroll-min::-webkit-scrollbar{
    height: 8px;
  }

  .emoji-popover-inner::-webkit-scrollbar-thumb, .scroll-min::-webkit-scrollbar-thumb
  {
    background-color: #bdbcbc;
  }

</style>
