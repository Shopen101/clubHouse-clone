import React, { useState } from 'react'
import { Button } from '../components/Button'
import { ConversationCard } from '../components/ConversationCard'
import { Header } from '../components/Header'
import Link from 'next/link'
import { Axios } from '../core/axios'
import { UserApi } from '../api/UserApi'
import { checkAuth } from '../utils/checkAuth'

export default function RoomsPage({ rooms }) {
  return (
    <>
      <Header />
      <div className="container">
        <div className="mt-40 d-flex align-items-center justify-content-between">
          <h1>All conversations</h1>
          <Button color="green">+ Start room</Button>
        </div>
        <div className="grid mt-30">
          {rooms.map(obj => {
            return (
              <Link href={`/rooms/${obj.id}`} key={obj.id}>
                <a>
                  <ConversationCard
                    title={obj.title}
                    listenersCount={obj.guestsCount}
                    speakers={obj.avatars}
                    guests={obj.guests}
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

export const getServerSideProps = async ctx => {
  try {
    // const { data } = await Axios.get('/rooms.json')
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

    return {
      props: {
        user,
        rooms: [],
      },
    }
  } catch (error) {
    console.log(error)

    return {
      props: { rooms: [] },
    }
  }
}
