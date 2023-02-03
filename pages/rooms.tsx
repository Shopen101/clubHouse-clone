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
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next'
import { useRouter } from 'next/router'
// import { addRoom } from '../redux/slices/roomSlice'
import { useDispatch, useSelector } from 'react-redux'
import { selectRooms } from '../redux/selectors'
import { Store } from '@reduxjs/toolkit'
import { wrapper } from '../redux/store'
import { setRooms } from '../redux/slices/roomSlice'
import { setUserData } from '../redux/slices/userSlice'

interface RoomPageProps {
  data: Room[]
}

const RoomPage: NextPage<RoomPageProps> = ({ data }) => {
  const [visibleModal, setVisibleModal] = React.useState<Boolean>(false)
  const dispatch = useDispatch()
  const rooms = useSelector(selectRooms)

  return (
    <>
      <Header />
      <div className="container">
        <div className="mt-40 d-flex align-items-center justify-content-between">
          <h1>All conversations</h1>
          <Button
            onClick={() =>
              // dispatch(
              //   addRoom({ id: 1, title: '', listenersCount: 0, speakers: [] }),
              // )
              setVisibleModal(true)
            }
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

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps(async ctx => {
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
      
      ctx.store.dispatch(setRooms(rooms))


      return {
        props: {},
      }
    } catch (error) {
      console.log('ERROR!')
      return {
        props: {
          rooms: [],
        },
      }
    }
  })

export default RoomPage
