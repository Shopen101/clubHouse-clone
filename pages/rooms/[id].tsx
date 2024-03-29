import { useRouter } from 'next/router'
import { Api } from '../../api'
import { BackButton } from '../../components/BackButton'
import { Button } from '../../components/Button'
import { Header } from '../../components/Header'
import { Room } from '../../components/Room'
import { Axios } from '../../core/axios'
import { wrapper } from '../../redux/store'
import { checkAuth } from '../../utils/checkAuth'

export default function RoomPage({ room }) {
  return (
    <>
      <Header />
      <div className="container mt-40 d-flex">
        <BackButton title="All rooms" href="/rooms" />
      </div>
      <Room title={room.title} />
    </>
  )
}

export const getServerSideProps = wrapper.getServerSideProps(async ctx => {
  try {
    const user = await checkAuth(ctx)

    if (!user) {
      return {
        props: {},
        redirect: {
          permanent: false,
          destination: '/',
        },
      }
    }

    const roomId = ctx.query.id
    const room = await Api(ctx).getRoom(roomId as string)

    return {
      props: {
        room,
      },
    }
  } catch (error) {
    console.log('ERROR!')
    return {
      props: {},
      redirect: {
        destination: '/rooms',
        permanent: false,
      },
    }
  }
})
