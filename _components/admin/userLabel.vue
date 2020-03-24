<template>
	<div>
		<q-expansion-item group="somegroup">
			<template v-slot:header >
				<q-item-section avatar class="q-ma-sm">
					<q-avatar>
						<img :src="user.smallImage">
					</q-avatar>
				</q-item-section>
				<q-item-section>
					{{ user.fullName }}
				</q-item-section>
			</template>
			<q-card>
				<q-card-section>
					<newConversation
						:user="user" />
				</q-card-section>
			</q-card>
		</q-expansion-item>
		<q-separator />
	</div>
</template>

<script>
	import newConversation from '@imagina/qchat/_components/admin/newConversation'
	
	export default {
	  components:{
        newConversation
		},
    props:{
      user:{
        type: Object,
	      default: () => {},
	      required: true
      }
		},
	}
</script>
