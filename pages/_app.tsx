import Head from 'next/head'
import { makeStore } from '../redux/store'
import withRedux from 'next-redux-wrapper'
import '../styles/globals.scss'

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Clubhouse: Drop-in audio chat</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default withRedux(makeStore)(App)
