/* eslint-disable jsx-a11y/anchor-has-content */
import Link from 'next/link'

const CustomLink = (props) => {
  let { href, children, ...rest } = props;
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')

  if (isInternalLink) {
    return (
      <Link legacyBehavior href={href}>
         <a {...rest}>{children}</a>
      </Link>
    )
  }

  if (isAnchorLink) {
    return <a href={href} {...rest} {...children} />
  }

  return <a target="_blank" rel="noreferrer" href={href} {...rest} {...children} />
}

export default CustomLink
