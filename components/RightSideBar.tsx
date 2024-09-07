"use client";

import { SignedIn, useUser, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from 'next/link';
import Carousel from "@/components/Carousel";
import Header from "@/components/Header";
import { useQuery } from "convex/react";
import LoaderSpinner from "@/components/LoaderSpinner";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/AudioProvider";

const RightSideBar = () => {
  const router = useRouter();
  const { user } = useUser();
  const { audio } = useAudio();
  const topPodcasters = useQuery(api.users.getTopUserByPodcastCount);

  if (!topPodcasters) {
    return (
      <div className="flex w-[310px] items-center justify-center h-full">
        <LoaderSpinner />;
      </div>
    );
  }

  return (
    <section className={cn('right_sidebar text-white-1 h-[calc(100vh-5px)]', {
      'h-[calc(100vh-140px)]': audio?.audioUrl
    })}>
      <SignedIn>
        <Link href={`/profile/${user?.id}`} className="flex gap-3 pb-12">
          <UserButton />
          <div className="flex w-full items-center justify-between">
            <h1 className="text-16 truncate font-semibold text-white-1">
              {user?.firstName} {user?.lastName}
            </h1>
            <Image
              src="/icons/right-arrow.svg"
              alt="arrow"
              width={24}
              height={24}
            />
          </div>
        </Link>
      </SignedIn>
      <section className="flex flex-col gap-4">
        <Header title="Fans Like You" />
        <Carousel fansLikeDetails={topPodcasters!} />
      </section>
      <section className="flex flex-col gap-8 pt-12">
        <Header title="Top Podcastrs" />
        <div className="flex flex-col gap-6">
          {topPodcasters?.slice(0, 3).map((podcaster) => (
            <div key={podcaster._id} className="flex cursor-pointer justify-between" onClick={() => router.push(`/profile/${podcaster.clerkId}`)}>
              <figure className="flex items-center gap-2">
                <Image
                  src={podcaster.imageUrl}
                  alt={podcaster.name}
                  width={44}
                  height={44}
                  className="aspect-square rounded-lg"
                />
                <h2 className="text-14 font-semibold text-white-1">{podcaster.name}</h2>
              </figure>
              <div className="flex items-center">
                <p className="text-12 font-normal text-white-1">{podcaster.totalPodcasts} podcasts</p>
              </div> 
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default RightSideBar
