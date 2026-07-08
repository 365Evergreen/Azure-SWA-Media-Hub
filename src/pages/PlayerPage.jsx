import { useNavigate, useParams } from 'react-router-dom'
import MediaPlayer from '../components/MediaPlayer.jsx'

/**
 * PlayerPage – streams the media item identified by :blobName route param.
 */
export default function PlayerPage() {
  const { blobName } = useParams()
  const navigate = useNavigate()

  const decodedName = decodeURIComponent(blobName ?? '')

  return (
    <MediaPlayer
      blobName={decodedName}
      title={decodedName}
      onClose={() => navigate('/media')}
    />
  )
}
