<template>
  <div>
    <q-btn
      dense
      flat
      round
      @click="showPanelUsers = !showPanelUsers">
      <q-icon name="message"/>
    </q-btn>
    <transition
      appear
      enter-active-class="animated fadeInLeft"
      leave-active-class="animated fadeOutLeft">
      <div
        v-show="showPanelUsers"
        class="absolute float-div bg-white">
        <q-list>
          <q-item-label header class="q-py-lg bg-primary text-white">
            <q-btn
              dense
              flat
              round
              @click="showPanelUsers = !showPanelUsers"
              icon="keyboard_backspace"/>
            Nuevo Chat
          </q-item-label>
        </q-list>
        <q-scroll-area
          ref="scrollAreaUsers"
          style="height: 78vh">
          <q-list>
            <div
              v-for="(user, index) in users"
              :key="index">
              <q-item v-ripple class="q-ml-sm q-my-sm">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="user.smallImage">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  {{user.fullName}}
                </q-item-section>
              </q-item>
              <q-separator />
            </div>
          </q-list>
        </q-scroll-area>
      </div>
    </transition>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        showPanelUsers: false,
        users: []
      }
    },
    mounted() {
      this.$nextTick( () => {
        this.getUsers()
      })
    },
    methods: {
      getUsers () {
        this.$crud.index('apiRoutes.quser.users').then( response => {
          this.users = response.data
        }).catch( error => (
          this.$alert.error({message: this.$tr('ui.message.errorRequest'), pos: 'bottom'})
        ))
      },
    }
  }
</script>

<style>
  .float-div{
    width: 100%;
    left: 0;
    top: 0;
    z-index: 100
  }
</style>