import React, { useState } from 'react'
import { Button } from '../components/Button'
import { ConversationCard } from '../components/ConversationCard'
import { Header } from '../components/Header'
import Link from 'next/link'
import { UserApi } from '../api/UserApi'
import { checkAuth } from '../utils/checkAuth'
import { StartRoomModal } from '../components/StartRoomModal'
import { Api } from '../api'
import { Room, RoomApi, RoomType } from '../api/RoomApi'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { addRoom } from '../redux/slices/roomSlice'
import { useDispatch } from 'react-redux'

interface RoomPageProps {
  rooms: Room[]
}

const RoomPage: NextPage<RoomPageProps> = ({ rooms }) => {
  const [visibleModal, setVisibleModal] = React.useState<Boolean>(false)
  const dispatch = useDispatch()

  return (
    <>
      <Header />
      <div className="container">
        <div className="mt-40 d-flex align-items-center justify-content-between">
          <h1>All conversations</h1>
          <Button
            onClick={() =>
              dispatch(
                addRoom({ id: 1, title: '', listenersCount: 0, speakers: [] }),
              )
            }
            // setVisibleModal(true)
            color="green">
            + Start room
          </Button>
          {visibleModal && (
            <StartRoomModal onClose={() => setVisibleModal(false)} />
          )}
        </div>
        <div className="grid mt-30">
          {rooms.map(obj => {
            return (
              <Link href={`/rooms/${obj.id}`} key={obj.id}>
                <a>
                  <ConversationCard
                    title={obj.title}
                    listenersCount={obj.listenersCount}
                    speakers={obj.speakers}
                  />
                </a>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  RoomPageProps
> = async ctx => {
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
    const rooms = await Api(ctx).getRooms()

    return {
      props: {
        rooms,
      },
    }
  } catch (error) {
    console.log(error)

    return {
      props: { rooms: [] },
    }
  }
}

export default RoomPage
