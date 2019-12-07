<template>
  <div class="row relative-position">
    <div class="row" style="min-width: 100%">
      <myComversations/>
    </div>
  </div>
</template>

<script>
  import conversation from '@imagina/qchat/_components/admin/conversation'
  import myComversations from '@imagina/qchat/_components/admin/myConversations'
  export default {
    components:{
      conversation,
      myComversations
    }
  }
</script>
