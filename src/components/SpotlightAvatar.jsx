import useAvatar from "../hooks/useAvatar.js"

export default function SpotlightAvatar({ person, fallbackSrc }) {
  const { src, onError } = useAvatar(person, fallbackSrc)
  return (
    <div className="spotlight__avatar">
      <img
        className="avatar__img"
        src={src}
        alt=""
        width="240"
        height="240"
        loading="lazy"
        decoding="async"
        onError={onError}
      />
    </div>
  )
}
