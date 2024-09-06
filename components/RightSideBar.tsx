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

const RightSideBar = () => {
  const router = useRouter();
  const { user } = useUser();
  const topPodcasters = useQuery(api.users.getTopUserByPodcastCount);

  if (!topPodcasters) {
    return (
      <div className="flex w-[310px] items-center justify-center h-full">
        <LoaderSpinner />;
      </div>
    );
  }

  return (
    <section className="right_sidebar text-white-1">
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
    </section>
  )
}

export default RightSideBar
