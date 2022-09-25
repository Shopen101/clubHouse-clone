import { useRouter } from 'next/router'
import { BackButton } from '../../components/BackButton'
import { Button } from '../../components/Button'
import { Header } from '../../components/Header'
import { Room } from '../../components/Room'
import { Axios } from '../../core/axios'

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

export const getServerSideProps = async ctx => {
  try {
    const { data } = await Axios.get('/rooms.json')
    const {
      query: { id },
    } = ctx

    const room = data.find(obj => obj.id === id)

    return {
      props: {
        room,
      },
    }
  } catch (error) {
    console.log(error)

    return {
      props: { room: [] },
    }
  }
}
