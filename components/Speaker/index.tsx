import Link from 'next/link'
import React from 'react'
import { Avatar } from '../Avatar'

export type SpeakerProps = {
  id: string | number
  fullName: string
  avatarUrl: string
}

export const Speaker: React.FC<SpeakerProps> = ({
  id,
  fullName,
  avatarUrl,
}) => {
  return (
    <Link href={`/profile/${id}`}>
      <a className="d-i-flex flex-column align-items-center mr-40 mb-40">
        <Avatar src={avatarUrl} height="100px" width="100px" />
        <div className="mt-10">
          <b>{fullName}</b>
        </div>
      </a>
    </Link>
  )
}
