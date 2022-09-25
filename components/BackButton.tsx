import React from 'react'
import Link from 'next/link'

type BackButtonProps = {
  title: string
  href: string
}

export const BackButton: React.FC<BackButtonProps> = ({ title, href }) => {
  return (
    <Link href={href}>
      <a>
        <div className="d-flex align-items-center">
          <img src="/static/back-arrow.svg" alt="Back" className="mr-10" />
          <h3>{title}</h3>
        </div>
      </a>
    </Link>
  )
}
