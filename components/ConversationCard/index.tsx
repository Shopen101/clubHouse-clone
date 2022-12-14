import React from 'react'
import { Avatar } from '../Avatar'

import styles from './ConversationCard.module.scss'
import whiteBlockStyles from '../WhiteBlock/WhiteBlock.module.scss'
import clsx from 'clsx'

interface ConversationCard {
  title: string
  speakers: string[]
  listenersCount: number
  guests?: string[]
}
{
  /* {speakers?.map((user, i) => (
            <Avatar
              key={user}
              width="45px"
              height="45px"
              src={user}
              className={
                speakers.length > 1 && i === speakers.length - 1
                  ? 'lastAvatar'
                  : ''
              }
            />
          ))} */
}
export const ConversationCard: React.FC<ConversationCard> = ({
  title,
  speakers = [],
  listenersCount,
  guests = [],
}) => {
  return (
    <div className={clsx(whiteBlockStyles.block, styles.card, 'mb-30')}>
      <h4 className={styles.title}>{title}</h4>
      <div className={clsx('d-flex mt-10', styles.content)}>
        <div className={styles.avatars}></div>
        <div className={clsx(styles.info, 'ml-10')}>
          <ul className={styles.users}>
            {guests.map((user, i) => (
              <li key={i}>
                {user}{' '}
                <img
                  src="/static/cloud.png"
                  alt="Cloud"
                  width={14}
                  height={14}
                />
              </li>
            ))}
          </ul>
          <ul className={styles.details}>
            <li>
              <img
                src="/static/user.svg"
                alt="Users count"
                width={12}
                height={12}
              />{' '}
              {listenersCount}
            </li>
            <li>
              <img
                className="ml-5"
                src="/static/message.svg"
                alt="Users count"
                width={12}
                height={12}
              />{' '}
              {speakers?.length}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
