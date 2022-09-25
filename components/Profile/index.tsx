import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'
import { Avatar } from '../Avatar'
import { BackButton } from '../BackButton'
import { Button } from '../Button'

import styles from './Profile.module.scss'

interface ProfileProps {
  fullName: string
  username: string
  avatarUrl: string
  about: string
}

export const Profile: React.FC<ProfileProps> = ({
  fullName,
  username,
  avatarUrl,
  about,
}) => {
  return (
    <>
      <BackButton title="Back" href="/rooms" />

      <div className="d-flex  align-items-center">
        <div className="d-flex align-items-center">
          <Avatar src={avatarUrl} width="100px" height="100px" />
          <div className="d-flex flex-column ml-30 mr-30">
            <h2 className="mt-0 mb-0">{fullName}</h2>
            <h3 className={clsx(styles.username, 'mt-0 mb-0')}>@{username}</h3>
          </div>
        </div>
        <Button className={styles.followButton} color="blue">
          Follow
        </Button>
      </div>
      <p className={styles.about}>{about}</p>
    </>
  )
}
