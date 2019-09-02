const moduleName = 'ichat';
const moduleVersion = 'v1';
const baseApiUrl = `${env('BASE_URL', 'http://localhost:8000')}/api`;
const urlBase = `${baseApiUrl}/${moduleName}/${moduleVersion}`

export default {
	urlBase : urlBase,
	version: moduleVersion,
  conversations : `${urlBase}/conversations`,
  conversationUser :`${urlBase}/conversation-user`,
  messages : `${urlBase}/messages`,
  users : `${urlBase}/users`,
}
