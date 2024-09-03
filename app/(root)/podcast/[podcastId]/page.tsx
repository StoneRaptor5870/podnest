const PodcastDetails = ({ params }: { params: { podcastId: string } }) => {
  return (
    <div>
      <h1 className="text-20 font-bold text-white-1">Podcast Details: {params.podcastId}</h1>
    </div>
  )
}

export default PodcastDetails
