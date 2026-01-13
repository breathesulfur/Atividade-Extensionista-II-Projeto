// Utilitários de autenticação

// Inicializa o Facebook SDK
export const initFacebookSDK = () => {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve(window.FB)
      return
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      })
      resolve(window.FB)
    }

    // Carrega o SDK do Facebook se ainda não estiver carregado
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/pt_BR/sdk.js'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  })
}

// Login com Facebook
export const loginWithFacebook = () => {
  return new Promise((resolve, reject) => {
    initFacebookSDK().then((FB) => {
      FB.login((response) => {
        if (response.authResponse) {
          // Busca informações do usuário
          FB.api('/me', { fields: 'name,email,picture' }, (userInfo) => {
            resolve({
              id: response.authResponse.userID,
              name: userInfo.name,
              email: userInfo.email || `${response.authResponse.userID}@facebook.com`,
              picture: userInfo.picture?.data?.url,
              provider: 'facebook',
              accessToken: response.authResponse.accessToken
            })
          })
        } else {
          reject(new Error('Login com Facebook cancelado'))
        }
      }, { scope: 'email,public_profile' })
    })
  })
}
