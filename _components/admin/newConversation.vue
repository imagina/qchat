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
      enter-active-class="animated bounceInLeft"
      leave-active-class="animated bounceOutLeft">
      <q-scroll-area
        v-show="showPanelUsers"
        ref="scrollAreaUsers"
        style="height: 80vh"
        class="absolute float-div bg-grey-1">
        <q-list >
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
    background: red;
    left: 0;
    top: 57px;
    z-index: 100
  }
</style>